const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addShift = async (req, res) => {
  try {
    let { StartTime, EndTime, Shift_name, sap_shift_id } = req.body;

    Shift_name = Shift_name.toUpperCase();

    const existingShift = await prisma.shiftsMaster.findFirst({
      where: {
        OR: [{ Shift_name }, { StartTime }, { sap_shift_id }],
      },
    });

    if (existingShift) {
      return res.status(400).json({
        error: "Shift with the same name or start time already exists",
      });
    }

    const Shift_ID = uuidv4();
    const newShift = await prisma.shiftsMaster.create({
      data: {
        Shift_ID,
        StartTime,
        EndTime,
        Shift_name,
        sap_shift_id,
      },
    });

    res.status(201).json(newShift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const shiftList = async (req, res) => {
  try {
    // Fetch all plants from the PlantMaster table
    const shiftList = await prisma.shiftsMaster.findMany();

    res.status(200).json(shiftList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addShift, shiftList };
