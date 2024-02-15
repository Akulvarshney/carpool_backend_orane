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
      vehicle_owner_id,
      vehicle_status,
    } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicle_plate },
    });

    if (existingVehicle) {
      return res
        .status(400)
        .json({ error: "Vehicle with the same plate already exists." });
    }

    const vehicle_id = uuidv4();

    // Create a new vehicle record
    const newVehicle = await prisma.vehicle.create({
      data: {
        vehicle_id,
        vehicle_plate,
        vehicle_type,
        vehicle_description,
        vehicle_owner_id,
        vehicle_status,
      },
    });

    res.json(newVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllVehicle = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        vehicle_owner: true,
        tripRequest: true,
        current_drivers: true,
      },
    });

    // console.log(vehicles);

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

module.exports = {
  createVehicleOwner,
  allVehicleOwner,
  createNewVehicle,
  getAllVehicle,
  findAvailableVehicle,
};
