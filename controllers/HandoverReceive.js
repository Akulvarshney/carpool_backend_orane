const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const handOverApi = async (req, res) => {
  try {
    const {
      message,
      driver_id,
      vehicleNumberId,
      dateAndTime,
      plant,
      odometer,
      fuelAmount,
      vehicle_photos,
      form_photo,
    } = req.body;

    const handOver = uuidv4();

    const handoverReceive = await prisma.handoverReceive.create({
      data: {
        id: handOver,
        driver_id,
        message,
        vehicle_id: vehicleNumberId,
        date_time: new Date(dateAndTime),
        plant_uuid_id: plant,
        odometerReading: odometer,
        fuelReading: fuelAmount,
        status: "HANDOVER",
        vehicle_photos,
        form_photo,
      },
    });

    const updatedDriver = await prisma.driver.update({
      where: { driver_id },
      data: {
        current_vehicle_id: null,
      },
    });

    res.json({ handoverReceive, updatedDriver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const receiveApi = async (req, res) => {
  try {
    const {
      message,
      driver_id,
      vehicleNumberId,
      dateAndTime,
      plant,
      odometer,
      fuelAmount,
      vehicle_photos,
      form_photo,
    } = req.body;

    const handOver = uuidv4();

    const handoverReceive = await prisma.handoverReceive.create({
      data: {
        id: handOver,
        driver_id,
        message,
        vehicle_id: vehicleNumberId,
        date_time: new Date(dateAndTime),
        plant_uuid_id: plant,
        odometerReading: odometer,
        fuelReading: fuelAmount,
        status: "RECEIVE",
        vehicle_photos,
        form_photo,
      },
    });

    const updatedDriver = await prisma.driver.update({
      where: { driver_id },
      data: {
        current_vehicle_id: vehicleNumberId,
      },
    });

    res.json({ handoverReceive, updatedDriver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handoverHistorywithdriverId = async (req, res) => {
  try {
    const { driver_id } = req.params;

    const handoverRecords = await prisma.handoverReceive.findMany({
      where: {
        driver_id: driver_id,
      },
      include: { vehicle: true, plant_uuid: true },
    });

    res.json(handoverRecords);
  } catch (error) {
    console.error("Error fetching handover records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createHandoverTransaction = async (req, res) => {
  try {
    const { from_driver_id, to_driver_id } = req.body;

    console.log(from_driver_id, to_driver_id);

    const toDriver = await prisma.driver.findUnique({
      where: { driver_id: to_driver_id },
      include: { current_vehicle: true },
    });

    if (toDriver && toDriver.current_vehicle) {
      res
        .status(200)
        .json({ message: "To Driver already has a current vehicle" });
      return;
    }

    const fromDriver = await prisma.driver.findUnique({
      where: { driver_id: from_driver_id },
      include: { current_vehicle: true },
    });

    if (!fromDriver || !fromDriver.current_vehicle) {
      res
        .status(200)
        .json({ message: "From Driver does not have a current vehicle" });
      return;
    }

    const existingPendingHandover = await prisma.vehicleHandover.findFirst({
      where: {
        OR: [
          { from_driver_id, handover_status: "Pending" },
          { to_driver_id, handover_status: "Pending" },
        ],
      },
    });

    if (existingPendingHandover) {
      res.status(200).json({
        message: "Either from_driver_id or to_driver_id has a pending handover",
      });
      return;
    }

    const vehicleDetail = await prisma.vehicle.findUnique({
      where: { vehicle_id: fromDriver.current_vehicle.vehicle_id },
    });

    const handOver = uuidv4();

    const VehicleHandover = await prisma.VehicleHandover.create({
      data: {
        handover_id: handOver,
        from_driver_id,
        to_driver_id,
        vehicle_id: vehicleDetail?.vehicle_id,
        handover_status: "Pending",
      },
    });

    res.status(200).json({ message: "Handover successful", VehicleHandover });
  } catch (error) {
    console.error("Error creating handover transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchAllHandoverTransactions = async (req, res) => {
  try {
    const vehicleHandovers = await prisma.vehicleHandover.findMany({
      orderBy: {
        created_on: "desc",
      },
      include: {
        from_driver: {
          include: {
            current_vehicle: true,
          },
        },
        to_driver: {
          include: {
            current_vehicle: true,
          },
        },
        hadnoverRecieve: true,
      },
    });

    res.status(200).json(vehicleHandovers);
  } catch (error) {
    console.error("Error fetching VehicleHandovers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createHandoverRecieveRecord = async (req, res) => {
  try {
    const {
      vehicle_handover_id,
      driver_id,
      fuelReading,
      odometerReading,
      message,
      handover_type,
      vehicle_photos,
      vehicleVehicle_id,
      form_photo,
    } = req.body;

    const existingHandover = await prisma.vehicleHandover.findUnique({
      where: { handover_id: vehicle_handover_id },
    });

    if (!existingHandover) {
      res.status(400).json({ message: "Invalid vehicle_handover_id" });
      return;
    }

    const existingDriver = await prisma.driver.findUnique({
      where: { driver_id },
    });

    if (!existingDriver) {
      res.status(400).json({ message: "Invalid driver_id" });
      return;
    }

    let handover_id = uuidv4();

    const newHandoverReceive = await prisma.handoverReceive.create({
      data: {
        handover_id,
        vehicle_handover_id,
        driver_id,
        handover_type,
        fuelReading,
        odometerReading,
        message,
        vehicle_photos,
        form_photo,
        vehicleVehicle_id,
      },
    });

    if (handover_type === "Handover") {
      await prisma.vehicleHandover.update({
        where: { handover_id: vehicle_handover_id },
        data: { Handover: true },
      });
    } else if (handover_type === "Receive") {
      await prisma.vehicleHandover.update({
        where: { handover_id: vehicle_handover_id },
        data: { Receive: true },
      });
    }

    res
      .status(201)
      .json({ message: "HandoverReceive record created", newHandoverReceive });
  } catch (error) {
    console.error("Error creating HandoverReceive record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchDriverBasedHandoverTransaction = async (req, res) => {
  try {
    const { driverId } = req.params;

    const vehicleHandover = await prisma.vehicleHandover.findMany({
      where: {
        OR: [{ from_driver_id: driverId }, { to_driver_id: driverId }],
      },
    });

    if (!vehicleHandover) {
      res.status(404).json({
        message: "VehicleHandover record not found for the provided driver_id",
      });
      return;
    }

    res.status(200).json(vehicleHandover);
  } catch (error) {
    console.error("Error fetching VehicleHandover record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  handOverApi,
  handoverHistorywithdriverId,
  receiveApi,
  createHandoverTransaction,
  fetchAllHandoverTransactions,
  createHandoverRecieveRecord,
  fetchDriverBasedHandoverTransaction,
};
