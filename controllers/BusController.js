const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const addBus = async (req, res) => {
  try {
    const { busName, busRegistrationNumber, ownerId, description } = req.body;

    const existingBus = await prisma.bus.findUnique({
      where: {
        busRegistrationNumber,
      },
    });

    if (existingBus) {
      return res
        .status(400)
        .json({ error: "Bus with this registration number already exists." });
    }

    const busId = uuidv4();

    const createdBus = await prisma.bus.create({
      data: {
        busId,
        busName,
        busRegistrationNumber,
        busDescription: description,
        vehicle_owner_id: ownerId,
      },
    });

    res.json({ message: "Bus added successfully", bus: createdBus });
  } catch (error) {
    console.error("Error adding bus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addBusRoutes = async (req, res) => {
  try {
    const { busId, busRouteName, busToOffice, busToHome } = req.body;

    const busRouteId = uuidv4();

    const newBusRoute = await prisma.busRoutes.create({
      data: {
        busRouteId,
        busId,
        busRouteName,
        busToOffice,
        busToHome,
      },
    });

    res.json(newBusRoute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchRoutesofBus = async (req, res) => {
  try {
    const busId = req.params.busId;

    const busRoutes = await prisma.busRoutes.findMany({
      where: {
        busId: busId,
      },
    });

    res.json(busRoutes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchBusList = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        vehicle_owner: {
          select: {
            vehicle_owner_id: true,
            owner_name: true,
          },
        },
        routes: {
          select: {
            busRouteId: true,
            busRouteName: true,
            busToOffice: true,
            busToHome: true,
          },
        },
      },
    });

    res.json(buses);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getStopByBusId = async (req, res) => {
  try {
    const { busId } = req.body;

    // Assuming you are using Prisma as the ORM
    const busStops = await prisma.bus.findUnique({
      where: {
        busId: busId,
      },
    });

    if (!busStops) {
      return res.status(404).json({ error: "busStops not found" });
    }

    const stops = busStops.bus_stop;

    return res.json({ busId, stops });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteStopsByBusId = async (req, res) => {
  try {
    const { busId } = req.body;
    const deletedBusStops = await prisma.bus.update({
      where: {
        busId: busId,
      },
      data: {
        bus_stop: null, // Remove all bus stops for the specified busId
      },
    });

    if (!deletedBusStops) {
      return res
        .status(404)
        .json({ error: "Bus not found for the given busId" });
    }

    return res.json({ message: `Deleted bus stops for busId ${busId}` });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteBusById = async (req, res) => {
  try {
    const { busId } = req.body;
    const deletedBus = await prisma.bus.delete({
      where: {
        busId: busId,
      },
    });
    if (!deletedBus) {
      return res
        .status(404)
        .json({ error: "Bus not found for the given busId" });
    }
    return res.json({ message: `Deleted bus with busId ${busId}` });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateBusDetail = async (req, res) => {
  try {
    const { busId, bus_route_name } = req.body;
    const updatedBus = await prisma.bus.update({
      where: {
        busId: busId,
      },
      data: {
        //sapBusId: sapBusId,
        // busRegistrationNumber: busRegistrationNumber,
        //vehicle_owner_id: vehicle_owner_id,
        bus_route_name: bus_route_name,
        //bus_stop: bus_stop,
      },
    });
    if (!updatedBus) {
      return res
        .status(404)
        .json({ error: "Bus not found for the given busId" });
    }
    return res.json({ message: `Updated bus details for busId ${busId}` });
  } catch (error) {}
};

const addRoutes2 = async (req, res) => {
  const { busId } = req.params;
  const { stopName, toOffice, toHome } = req.body;

  try {
    // Check if the bus exists
    const existingBus = await prisma.bus.findUnique({
      where: { busId },
    });

    if (!existingBus) {
      return res.status(404).json({ error: "Bus not found" });
    }

    let busRouteId = uuidv4();

    const newBusRoute = await prisma.busRoutes.create({
      data: {
        busId,
        busRouteId,
        busRouteName: stopName,
        busToOffice: toOffice,
        busToHome: toHome,
      },
    });

    res.json(newBusRoute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addBus,
  fetchRoutesofBus,
  addBusRoutes,
  fetchBusList,
  getStopByBusId,
  deleteStopsByBusId,
  deleteBusById,
  updateBusDetail,
  addRoutes2,
};
