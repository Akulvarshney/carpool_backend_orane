const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");

const fetchPlantsSap = async (req, res) => {
  try {
    const plants = req?.body;

    if (!Array.isArray(plants)) {
      return res
        .status(400)
        .json({ error: "Invalid input format. Expected an array of plants" });
    }

    const results = [];

    console.log(plants);

    for (const { sap_plant_id, plant_name } of plants) {
      try {
        const existingPlant = await prisma.plantMaster.findUnique({
          where: { sap_plant_id },
        });

        if (existingPlant) {
          if (existingPlant.plant_name !== plant_name) {
            await prisma.plantMaster.update({
              where: { sap_plant_id },
              data: { plant_name },
            });
          }

          results.push({
            sap_plant_id,
            plant_uuid_id: existingPlant.plant_uuid_id,
            message: "Plant updated successfully",
          });
        } else {
          const plant_new_uuid = uuidv4();
          const newPlant = await prisma.plantMaster.create({
            data: {
              plant_uuid_id: plant_new_uuid,
              sap_plant_id,
              plant_name,
            },
          });

          results.push({
            sap_plant_id,
            message: "Plant created successfully",
            plant_uuid_id: newPlant.plant_uuid_id,
            plant: newPlant,
          });
        }
      } catch (error) {
        results.push({ sap_plant_id, error: error.message });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchShiftSap = async (req, res) => {
  try {
    const shiftsData = req.body;

    if (!Array.isArray(shiftsData)) {
      return res
        .status(400)
        .json({ error: "Invalid input format. Expected an array of shifts" });
    }

    const results = [];

    for (const { sap_shift_id, StartTime, EndTime, Shift_name } of shiftsData) {
      try {
        const existingShift = await prisma.shiftsMaster.findUnique({
          where: { sap_shift_id },
        });

        if (existingShift) {
          await prisma.shiftsMaster.update({
            where: { sap_shift_id },
            data: { StartTime, EndTime, Shift_name },
          });

          results.push({ sap_shift_id, message: "Shift updated successfully" });
        } else {
          const newShift = await prisma.shiftsMaster.create({
            data: {
              Shift_ID: uuidv4(),
              sap_shift_id,
              StartTime,
              EndTime,
              Shift_name,
            },
          });

          results.push({
            sap_shift_id,
            message: "Shift created successfully",
            shift: newShift,
          });
        }
      } catch (error) {
        results.push({ sap_shift_id, error: error.message });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const importUserSap = async (req, res) => {
  const users = req.body;
  const allowedRoles = ["manager", "employee", "fleet"];
  const results = [];

  try {
    await Promise.all(
      users.map(async (user) => {
        const lowerCaseRole = user.role.toLowerCase();
        const newEmail = user.emailId.toLowerCase();

        if (!allowedRoles.includes(lowerCaseRole)) {
          results.push({
            sapUserId: user.sap_user_id,
            status: "User role not allowed",
          });
          return;
        }

        const existingAuthUser = await prisma.auth.findUnique({
          where: { emailId: newEmail },
        });

        if (existingAuthUser) {
          results.push({
            sapUserId: user.sap_user_id,
            status: "Already exists in Auth table",
          });
        } else {
          const authenticationId = uuidv4();
          const hashedPassword = await bcrypt.hash("Carpool123", 10);

          const createdAuthUser = await prisma.auth.create({
            data: {
              authentication_id: authenticationId,
              emailId: newEmail,
              password: hashedPassword,
              role: lowerCaseRole,
            },
          });

          const userId = uuidv4();
          const createdUser = await prisma.users.create({
            data: {
              user_id: userId,
              sap_user_id: user.sap_user_id,
              sap_Manger_id: user?.sap_Manager_id,
              authentication_id: createdAuthUser.authentication_id,
              name: user.name,
              address: user.address,
              designation: user.designation,
              dob: user.dob ? new Date(user.dob) : null,
              mobile_number: user.mobile_number,
              plant_uuid_id: user.plant_uuid,
              role: lowerCaseRole,
            },
          });

          results.push({
            sapUserId: user.sap_user_id,
            userId: createdUser.user_id,
            status: "Successfully created",
          });
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importDriverSap = async (req, res) => {
  const drivers = req.body;
  const results = [];

  try {
    await Promise.all(
      drivers.map(async (driverData) => {
        const lowerCaseRole = driverData.role.toLowerCase();
        if (driverData.role !== "driver") {
          results.push({
            sapDriverId: driverData.sap_driver_id,
            status: "Role must be Driver",
          });
          return;
        }

        const existingAuthDriver = await prisma.auth.findUnique({
          where: { emailId: driverData.emailId },
        });

        if (existingAuthDriver) {
          results.push({
            sapDriverId: driverData.sap_driver_id,
            status: "Email already exists in Auth table",
          });
          return;
        }

        const authenticationId = uuidv4();
        const hashedPassword = await bcrypt.hash("Carpool123", 10);

        const createdAuthDriver = await prisma.auth.create({
          data: {
            authentication_id: authenticationId,
            emailId: driverData.emailId,
            password: hashedPassword,
            role: lowerCaseRole,
            phone_number: driverData?.mobile_number || null,
          },
        });

        const driverId = uuidv4();
        const createdDriver = await prisma.driver.create({
          data: {
            driver_id: driverId,
            sap_driver_id: driverData.sap_driver_id,
            authentication_id: createdAuthDriver.authentication_id,
            driver_employee_id: driverData.driver_employee_id,
            driver_type: driverData.driver_type,
            emailId: driverData.emailId,
            vehicle_type: { set: driverData.vehicle_type },
            name: driverData.name,
            mobile_number: driverData.mobile_number,
            location: driverData.location,
            sex: driverData.sex,
            plant_uuid_id: driverData.plant_uuid_id,
            jobgrade: driverData.jobgrade,
            shift_id: driverData?.shift_id || null,
            dob: new Date(driverData.dob) || null,
            experience: driverData.experience,
          },
        });

        results.push({
          sapDriverId: driverData.sap_driver_id,
          driverId: createdDriver.driver_id,
          status: "Successfully created",
        });
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importVehicleSap = async (req, res) => {
  const vehicles = req.body;
  const results = [];

  try {
    await Promise.all(
      vehicles.map(async (vehicleData) => {
        const existingVehicle = await prisma.vehicle.findFirst({
          where: {
            OR: [
              { sap_vehicle_id: vehicleData.sap_vehicle_id },
              { vehicle_plate: vehicleData.vehicle_plate },
            ],
          },
        });

        if (existingVehicle) {
          results.push({
            sapVehicleId: vehicleData.sap_vehicle_id,
            status: "Already exists in Vehicle table",
          });
          return;
        }

        const vehicleId = uuidv4();
        const createdVehicle = await prisma.vehicle.create({
          data: {
            vehicle_id: vehicleId,
            sap_vehicle_id: vehicleData.sap_vehicle_id,
            vehicle_plate: vehicleData.vehicle_plate,
            vehicle_type: vehicleData.vehicle_type,
            vehicle_description: vehicleData.vehicle_description,
            vehicle_owner_id: vehicleData.vehicle_owner_id,
            plant_uuid_id: vehicleData?.plant_uuid_id,
          },
        });

        results.push({
          sapVehicleId: vehicleData.sap_vehicle_id,
          vehicleId: createdVehicle.vehicle_id,
          status: "Successfully created",
        });
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importVehicleOwnerSap = async (req, res) => {
  const owners = req.body;
  const results = [];

  try {
    await Promise.all(
      owners.map(async (ownerData) => {
        const existingOwner = await prisma.vehicleOwner.findFirst({
          where: {
            sap_vehicleOwner_id: ownerData.sap_vehicleOwner_id,
          },
        });

        if (existingOwner) {
          results.push({
            sapVehicleOwnerId: ownerData.sap_vehicleOwner_id,
            status: "Already exists in VehicleOwner table",
          });
          return;
        }

        const ownerId = uuidv4();
        const createdOwner = await prisma.vehicleOwner.create({
          data: {
            vehicle_owner_id: ownerId,
            sap_vehicleOwner_id: ownerData.sap_vehicleOwner_id,
            owner_name: ownerData.owner_name,
            sex: ownerData.sex,
            phone_number: ownerData.phone_number,
            email_id: ownerData.email_id,
            state: ownerData.state,
            city: ownerData.city,
            address: ownerData.address,
          },
        });

        results.push({
          sapVehicleOwnerId: ownerData.sap_vehicleOwner_id,
          ownerId: createdOwner.vehicle_owner_id,
          status: "Successfully created",
        });
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  fetchPlantsSap,
  fetchShiftSap,
  importUserSap,
  importDriverSap,
  importVehicleSap,
  importVehicleOwnerSap,
};
