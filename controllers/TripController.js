const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const allUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        user_id: true,
        name: true,
        profile_image: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching Users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const requestTrip = async (req, res) => {
  const {
    plant_uuid_id,
    user_id,
    vehicle_type,
    purpose,
    department,
    priority,
    passengers_number,
    people,
    start_time,
    end_time,
    from_destination,
    to_destination,
    pickup_point,
    drop_point,
    trip_type,
    status,
    comments,
    number_of_Days,
    approved_by_manager,
  } = req.body;
  try {
    const trip_id = uuidv4();
    const random4DigitNumber = Math.floor(1000 + Math.random() * 9000);

    const newTripRequest = await prisma.tripRequest.create({
      data: {
        trip_id,
        plant_uuid_id,
        user_id,
        vehicle_type,
        purpose: purpose || null,
        department: department || null,
        priority: priority || null,
        passengers_number: passengers_number || 1,
        people: people || [],
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        from_destination,
        number_of_Days: number_of_Days || 0,
        to_destination,
        pickup_point,
        drop_point,
        trip_type: trip_type || null,
        status: status || "Requested",
        comments: comments || null,
        approved_by_manager: approved_by_manager || false,
        otp: random4DigitNumber,
      },
    });

    await prisma.users.update({
      where: {
        user_id,
      },
      data: {
        triprequested: {
          increment: 1,
        },
      },
    });

    res.status(201).json(newTripRequest);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const approveByManager = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { approvedByManager } = req.body;

    const updatedTripRequest = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: { approved_by_manager: approvedByManager },
    });

    res.status(200).json(updatedTripRequest);
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const recentTripUserId = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    const trips = await prisma.tripRequest.findMany({
      where: {
        user_id,
      },
      include: {
        user: true, // Include user information
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching Trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tripsForDriver = async (req, res) => {
  try {
    const { assigned_driver_id } = req.query;

    if (!assigned_driver_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    const trips = await prisma.tripRequest.findMany({
      where: {
        assigned_driver_id,
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching Trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const tripDetail = async (req, res) => {
  try {
    const { trip_id } = req.params;

    if (!trip_id) {
      return res.status(400).json({ error: "trip_id parameter is required" });
    }

    const tripDetails = await prisma.tripRequest.findUnique({
      where: {
        trip_id,
      },
      include: {
        plant_uuid: true,
        user: true,
        assigned_car: true,
        assigned_driver: true,
        fuels: true,
      },
    });

    if (!tripDetails) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.status(200).json(tripDetails);
  } catch (error) {
    console.error("Error fetching Trip details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const feedback = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const { rating, feedback_message } = req.body;

    if (!trip_id || !rating) {
      return res
        .status(400)
        .json({ error: "trip_id, rating, and comments are required" });
    }

    const updatedTrip = await prisma.tripRequest.update({
      where: {
        trip_id,
      },
      data: {
        rating,
        feedback_message,
      },
    });

    res.status(200).json({ message: "Trip updated successfully", updatedTrip });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchTripsWithStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        status: status || "Pending",
      },
      include: {
        user: true,
      },
    });

    res.json(tripRequests);
  } catch (error) {
    console.error("Error fetching trip requests:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updateStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { newStatus } = req.body;

    // Fetch the TripRequest from the database
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { trip_id: tripId },
    });

    if (!tripRequest) {
      return res.status(404).json({ error: "TripRequest not found" });
    }

    // Update the status
    const updatedTripRequest = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: { status: newStatus },
    });

    res.json(updatedTripRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findDriver = async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.body;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        error: "Missing startDateTime or endDateTime in the request body",
      });
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const availableDrivers = await prisma.driver.findMany({
      where: {
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

    res.json({ availableDrivers }).status(200);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const approvingTrip = async (req, res) => {
  const { tripId, assignedDriverId, assignedCarId } = req.body;

  try {
    const updatedTrip = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: {
        assigned_driver_id: assignedDriverId,
        assigned_car_id: assignedCarId,
        status: "Assigned",
      },
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const cancelLesson = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { cancel_message } = req.body;

    if (!tripId || !cancel_message) {
      return res.status(400).json({
        error: "Missing tripId or cancel_message in the request",
      });
    }

    const updatedTrip = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: {
        status: "Cancelled",
        cancel_message,
      },
    });

    res.json(updatedTrip).status(200);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const driverActualTripTiming = async (req, res) => {
  const { tripId } = req.params;
  const {
    actualTripStart,
    actualTripEnd,
    odometerStarting,
    odometerEnding,
    fuelEnding,
    fuelStarting,
  } = req.body;

  try {
    let updateData = {
      status: actualTripEnd ? "Completed" : "Trip Started",
    };

    if (actualTripStart && odometerStarting) {
      updateData = {
        ...updateData,
        actual_trip_start: actualTripStart,
        odometerStarting: odometerStarting,
        fuelStarting,
      };
    }

    if (actualTripEnd && odometerEnding) {
      updateData = {
        ...updateData,
        actual_trip_end: actualTripEnd,
        odometerEnding: odometerEnding,
        fuelEnding,
      };
    }

    const updatedTrip = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: updateData,
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTripForDriver = async (req, res) => {
  const { driverId } = req.params;

  try {
    const trips = await prisma.tripRequest.findMany({
      where: {
        assigned_driver_id: driverId,
      },
      include: {
        assigned_driver: true,
        user: true,
        // Add other associations if needed
      },
    });

    res.json(trips).status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fleetAssigningTrips = async (req, res) => {
  try {
    const { plantId } = req.body;

    let queryOptions = {
      where: {
        approved_by_manager: true,
      },
      include: {
        user: true,
        plant_uuid: true,
      },
    };

    if (plantId) {
      queryOptions.where.plant_uuid_id = plantId;
    }

    const approvedTrips = await prisma.tripRequest.findMany(queryOptions);

    res.status(200).json(approvedTrips);
  } catch (error) {
    console.error("Error fetching approved trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findAvailableVehicle2 = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    const availableVehicles = await prisma.vehicle.findMany({
      where: {
        tripRequest: {
          none: {
            OR: [
              {
                start_time: { lte: end_time },
                end_time: { gte: start_time },
              },
              {
                AND: [
                  { start_time: { lte: end_time } },
                  { end_time: { gte: start_time } },
                ],
              },
            ],
          },
        },
      },
    });

    // Fetch trips for each available vehicle for the particular day
    const vehiclesWithTrips = await Promise.all(
      availableVehicles.map(async (vehicle) => {
        const vehicleWithDriver = await prisma.vehicle.findUnique({
          where: {
            vehicle_id: vehicle.vehicle_id,
          },
          include: {
            current_drivers: true,
          },
        });

        const vehicleTrips = await prisma.tripRequest.findMany({
          where: {
            assigned_driver_id: vehicle.current_drivers?.driver_id,
            start_time: {
              lte: end_time,
              gte: start_time,
            },
            end_time: {
              gte: start_time,
              lte: end_time,
            },
          },
        });

        return { ...vehicleWithDriver, trips: vehicleTrips };
      })
    );

    res.json({ availableVehicles: vehiclesWithTrips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const assignedVehicle = async (req, res) => {
  const { tripId, assignedCarId, assignedDriverId } = req.body;

  try {
    console.log(tripId, assignedCarId);
    const updatedTripRequest = await prisma.tripRequest.update({
      where: { trip_id: tripId },
      data: {
        assigned_car_id: assignedCarId,
        assigned_driver_id: assignedDriverId,
        status: "Assigned",
      },
    });

    res.json(updatedTripRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const managerApprovalTrips = async (req, res) => {
  try {
    const { plantId } = req.query;
    const { approvedStatus } = req.query;

    const isApproved = approvedStatus === "true";

    const trips = await prisma.tripRequest.findMany({
      where: {
        plant_uuid_id: plantId,
        approved_by_manager: isApproved,
      },
      include: {
        user: true,
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  requestTrip,
  allUsers,
  recentTripUserId,
  tripDetail,
  feedback,
  tripsForDriver,
  fetchTripsWithStatus,
  updateStatus,
  findDriver,
  approvingTrip,
  cancelLesson,
  driverActualTripTiming,
  getTripForDriver,
  approveByManager,
  fleetAssigningTrips,
  managerApprovalTrips,
  findAvailableVehicle2,
  assignedVehicle,
};
