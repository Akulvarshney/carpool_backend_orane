const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addDriver = async (req, res, next) => {
  try {
    const {
      email,
      name,
      sex,
      vehicle_type,
      phoneNumber,
      state,
      city,
      location,
      plant_uuid_id,
      jobgrade,
      rating,
      trips_completed,
      experience,
      profile_image,
      shift_id,
      driver_employee_id,
      dob,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const authId = uuidv4();
    const driverId = uuidv4();

    const existingUser = await prisma.auth.findUnique({
      where: { emailId: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash("Carpool123", 10);

    const newUser = await prisma.auth.create({
      data: {
        authentication_id: authId,
        emailId: email,
        password: hashedPassword,
        role: "driver",
        created_on: new Date(),
      },
    });

    const newDriver = await prisma.driver.create({
      data: {
        driver_id: driverId,
        authentication_id: authId,
        sap_driver_id: driver_employee_id || null,
        emailId: email,
        vehicle_type: vehicle_type || null,
        name: name || null,
        mobile_number: phoneNumber || null,
        location: location || null,
        city: city || null,
        state: state || null,
        sex: sex || null,
        plant_uuid_id: plant_uuid_id,
        jobgrade: jobgrade || null,
        experience: experience || null,
        rating: rating || null,
        trips_completed: trips_completed || 0,
        dob: new Date(dob) || null,
        profile_image: profile_image || null,
        shift_id: shift_id || null,
        created_on: new Date(),
      },
    });

    res.status(201).json({
      message: "User and Driver registered successfully",
      user: newUser,
      driver: newDriver,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

const fetchDriverList = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        current_vehicle: true,
        shift: true,
      },
    });
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchAllUnlinkedVehicle = async (req, res) => {
  try {
    const linkedVehicleIds = await prisma.driver.findMany({
      select: { current_vehicle_id: true },
      where: { current_vehicle_id: { not: null } },
    });

    const unassignedVehicles = await prisma.vehicle.findMany({
      where: {
        NOT: {
          vehicle_id: {
            in: linkedVehicleIds.map((driver) => driver.current_vehicle_id),
          },
        },
      },
    });

    res.json(unassignedVehicles);
  } catch (error) {
    console.error("Error fetching unlinked vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeShiftOrVehicle = async (req, res) => {
  try {
    const { driver_id, shift_id, vehicle_id } = req.body;

    // Validate that at least one of shift_id or vehicle_id is provided
    if (!shift_id && !vehicle_id) {
      return res.status(400).json({
        error: "At least one of shift_id or vehicle_id should be provided.",
      });
    }

    // Find the driver by ID
    const existingDriver = await prisma.driver.findUnique({
      where: { driver_id },
    });

    // If the driver doesn't exist, return an error
    if (!existingDriver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    // Update the shift_id if provided
    if (shift_id) {
      await prisma.driver.update({
        where: { driver_id },
        data: { shift_id },
      });
    }

    // Update the current_vehicle_id if provided
    if (vehicle_id) {
      await prisma.driver.update({
        where: { driver_id },
        data: { current_vehicle_id: vehicle_id },
      });
    }

    return res.status(200).json({ message: "Driver updated successfully." });
  } catch (error) {
    console.error("Error updating driver:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addDriver,
  fetchDriverList,
  fetchAllUnlinkedVehicle,
  changeShiftOrVehicle,
};
