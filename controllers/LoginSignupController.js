const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const jwt = require("jsonwebtoken");

const allowedRoles = ["manager", "employee", "driver", "carOwner", "fleet"];

const login = async (req, res) => {
  try {
    let { emailId, password } = req.body;

    console.log(emailId, password);

    emailId = emailId.toLowerCase();

    const user = await prisma.auth.findFirst({
      where: {
        OR: [
          {
            emailId: emailId,
          },
          {
            phone_number: emailId,
          },
        ],
      },
    });

    // console.log("asdasd", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.authentication_id },
      process.env.SECRE_KEY
    );

    let first_time = user.first_time;
    let authId = user.authentication_id;
    let dataStored = false;
    let user_id = null;
    let auth_id = null;

    if (
      user.role === "manager" ||
      user.role === "employee" ||
      user.role === "fleet"
    ) {
      const userRecord = await prisma.users.findUnique({
        where: { authentication_id: user.authentication_id },
      });

      if (userRecord) {
        dataStored = true;
        user_id = userRecord.user_id;
      } else {
        dataStored = false;
        auth_id = user.authentication_id;
      }
    } else if (user.role === "driver") {
      const driverRecord = await prisma.driver.findUnique({
        where: { authentication_id: user.authentication_id },
      });

      if (driverRecord) {
        dataStored = true;
        user_id = driverRecord.driver_id;
      } else {
        dataStored = false;
        auth_id = user.authentication_id;
      }
    }

    if (auth_id) {
      res.status(200).json({
        token,
        userRole: user.role,
        dataStored,
        auth_id,
        first_time,
        authId,
      });
    } else {
      res.status(200).json({
        token,
        userRole: user.role,
        dataStored,
        user_id,
        first_time,
        authId,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signupEmpMan = async (req, res, next) => {
  let { emailId, password, role, phone_number } = req.body;

  emailId = emailId.toLowerCase();

  if (!emailId || !password || !role) {
    return next(
      errorHandler(400, `Missing required information: emailId, password, role`)
    );
  }

  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid role", allowedRoles });
  }

  try {
    const userExistsQuery = await prisma.auth.findUnique({
      where: { emailId: emailId },
    });

    if (userExistsQuery) {
      return next(errorHandler(400, "User already exists"));
    }

    const authentication_id = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdOn = new Date();

    await prisma.auth.create({
      data: {
        authentication_id,
        emailId,
        password: hashedPassword,
        created_on: createdOn,
        phone_number,
        role,
      },
    });

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  } finally {
    await prisma.$disconnect();
  }
};

const register_User = async (req, res, next) => {
  const { name, emailId, address, designation, dob, mobileNumber } = req.body;

  if (!emailId || !name || !address) {
    return next(
      errorHandler(
        400,
        `Missing Required information ${emailId}, ${name}, ${address}`
      )
    );
  }

  try {
    // Step 1: Fetch authentication id from the auth table
    const authRecord = await prisma.auth.findUnique({
      where: { emailId },
    });

    if (!authRecord) {
      return res.status(404).json({ error: "Email not present in auth table" });
    }

    // Step 2: Check if authentication id is already in the users table
    const existingUser = await prisma.users.findUnique({
      where: { authentication_id: authRecord.authentication_id },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user_id = uuidv4();

    // Step 3: Add user details to the users table
    const newUser = await prisma.users.create({
      data: {
        authentication: {
          connect: { authentication_id: authRecord.authentication_id },
        },
        user_id,
        name,
        address,
        designation,
        dob: new Date(dob),
        role: authRecord.role,
        mobile_number: mobileNumber,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchUserDetailUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { userRole } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    let userDetails;

    if (userRole === "Driver") {
      userDetails = await prisma.driver.findUnique({
        where: {
          driver_id: user_id,
        },
        include: {
          current_vehicle: true,
          shift: true,
          authentication: true,
        },
      });
      userDetails = { ...userDetails, role: "driver" };
    } else {
      userDetails = await prisma.users.findUnique({
        where: {
          user_id,
        },
        include: {
          authentication: true,
        },
      });
    }

    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const firstTimePassword = async (req, res) => {
  const { authentication_id, password } = req.body;
  console.log(authentication_id, password);

  try {
    const existingAuth = await prisma.auth.findUnique({
      where: { authentication_id },
    });

    if (!existingAuth) {
      return res.status(404).json({ error: "Authentication ID not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.auth.update({
      where: { authentication_id },
      data: {
        password: hashedPassword,
        first_time: true,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fleetDashboard = async (req, res) => {
  try {
    const { plant_uuid_id } = req.params;
    console.log(plant_uuid_id);

    const trips = await prisma.tripRequest.findMany({
      where: {
        plant_uuid_id: plant_uuid_id,
      },
    });

    const statusCounts = {
      Requested: 0,
      Cancelled: 0,
      Assigned: 0,
    };

    const priorityCounts = {
      Emergency: 0,
      Urgent: 0,
      Normal: 0,
    };

    let forwardedRequestedCount = 0;

    trips.forEach((trip) => {
      const status = trip?.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      const priority = trip?.priority;
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;

      if (trip?.forwarded && status === "Requested") {
        forwardedRequestedCount += 1;
      }
    });

    res.json({ statusCounts, priorityCounts, forwardedRequestedCount });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  signupEmpMan,
  register_User,
  fetchUserDetailUserId,
  login,
  firstTimePassword,
  fleetDashboard,
};
