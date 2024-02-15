const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addFuel = async (req, res) => {
  try {
    const {
      trip_id,
      currentReading,
      fuelAmountRequired,
      location,
      driver_id,
      fuelLoaded,
      invoiceImage,
      currentReadingImage,
    } = req.body;

    const fuelId = uuidv4();

    const currentTime = new Date();

    const createdFuel = await prisma.fuel.create({
      data: {
        id: fuelId,
        currentReading,
        invoiceAmount: fuelAmountRequired,
        time: currentTime,
        fuelStationLocation: location,
        trip_id,
        fuelLoaded,
        driver_id,
        invoiceImage,
        currentReadingImage,
      },
    });

    res.status(201).json(createdFuel);
  } catch (error) {
    console.error("Error creating fuel record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const driverFuelList = async (req, res) => {
  try {
    const { driverId, tripId } = req.body;

    let queryOptions = {};

    if (driverId) {
      queryOptions = {
        where: {
          driver_id: driverId,
        },
        include: {
          assigned_driver: true,
          trip_uuid: {
            include: {
              assigned_car: true,
            },
          },
        },
      };
    } else if (tripId) {
      queryOptions = {
        where: {
          trip_id: tripId,
        },
        include: {
          assigned_driver: true,
          trip_uuid: {
            include: {
              assigned_car: true,
            },
          },
        },
      };
    } else {
      queryOptions = {
        include: {
          assigned_driver: true,
          trip_uuid: {
            include: {
              assigned_car: true,
            },
          },
        },
      };
    }

    const fuelExpenses = await prisma.fuel.findMany(queryOptions);

    res.status(200).json(fuelExpenses);
  } catch (error) {
    console.error("Error fetching fuel expenses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addFuel, driverFuelList };
