const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const createVehicleOwner = async (req, res) => {
  try {
    const { owner_name, sex, phone_number, email_id, state, city, address } =
      req.body;

    const vehicle_owner_id = uuidv4();
    const newVehicleOwner = await prisma.vehicleOwner.create({
      data: {
        vehicle_owner_id,
        owner_name,
        sex,
        phone_number,
        email_id,
        state,
        city,
        address,
      },
    });

    res.json(newVehicleOwner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allVehicleOwner = async (req, res) => {
  try {
    const owners = await prisma.vehicleOwner.findMany({
      select: {
        vehicle_owner_id: true,
        owner_name: true,
      },
    });

    res.json(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createNewVehicle = async (req, res) => {
  try {
    const {
      vehicle_plate,
      vehicle_type,
      vehicle_description,
      // vehicle_owner_id,
      vehicle_status,
      plant_uuid_id,
    } = req.body;

    console.log(req.body);

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicle_plate },
    });

    if (existingVehicle) {
      return res
        .status(400)
        .json({ error: "Vehicle with the same plate already exists." });
    }

    const vehicle_id = uuidv4();

    console.log("vehiid", vehicle_id, "plate", vehicle_plate, "type");

    const newVehicle = await prisma.vehicle.create({
      data: {
        vehicle_id,
        vehicle_plate,
        vehicle_type,
        vehicle_description,
        // vehicle_owner_id,
        vehicle_status,
        plant_uuid_id,
      },
    });

    res.json(newVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const changeVehicleStatus = async (req, res) => {
  try {
    const { vehicleId, newStatus } = req.params;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicle_id: vehicleId },
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: { vehicle_status: newStatus },
    });

    return res.json(updatedVehicle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllVehicle = async (req, res) => {
  try {
    const { plantId } = req.params;

    console.log("asdasd", plantId);

    const vehicles = await prisma.vehicle.findMany({
      where: {
        softDelet: false,
      },
      include: {
        vehicle_owner: true,
        tripRequest: true,
        current_drivers: true,
      },
    });

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findAvailableVehicle = async (req, res) => {
  try {
    const { startDateTime, endDateTime, vehicle_type } = req.body;

    if (!startDateTime || !endDateTime || !vehicle_type) {
      return res.status(400).json({
        error:
          "Missing startDateTime, endDateTime, or vehicle_type in the request body",
      });
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const availableVehicles = await prisma.vehicle.findMany({
      where: {
        softDelet: false,
        vehicle_type,
        tripRequest: {
          every: {
            OR: [
              { end_time: { lte: startDate } },
              { start_time: { gte: endDate } },
              { status: "Cancelled" },
            ],
          },
        },
      },
    });

    res.json({ availableVehicles }).status(200);
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const softDeleteVehicle = async (req, res) => {
  try {
    const { vehicleId, softDelete } = req.body;

    console.log(vehicleId, softDelete);

    if (softDelete === undefined) {
      return res
        .status(400)
        .json({ error: "Missing softDelete field in request body" });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: {
        softDelet: softDelete,
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle softDelete:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateVehicleDetail = async (req, res) => {
  const { vehicleId } = req.params;
  const { vehicle_plate, vehicle_type, vehicle_description, vehicle_owner_id } =
    req.body;

  try {
    // Update the vehicle details
    const updatedVehicle = await prisma.vehicle.update({
      where: {
        vehicle_id: vehicleId,
      },
      data: {
        vehicle_plate,
        vehicle_type,
        vehicle_description,
        vehicle_owner_id,
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchVehicleDetail = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    // Fetch the vehicle details with associated data
    const vehicleDetails = await prisma.vehicle.findUnique({
      where: {
        vehicle_id: vehicleId,
      },
      include: {
        plant_uuid: true,
        vehicle_owner: true,
        current_drivers: true,
        handoverReceive: true,
        tripRequest: true,
        vehicleHandover: true,
      },
    });

    if (!vehicleDetails) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(vehicleDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createVehicleOwner,
  allVehicleOwner,
  createNewVehicle,
  getAllVehicle,
  findAvailableVehicle,
  softDeleteVehicle,
  updateVehicleDetail,
  fetchVehicleDetail,
  changeVehicleStatus,
};
