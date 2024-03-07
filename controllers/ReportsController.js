const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { promisify } = require("util");
const fs = require("fs");
const excel = require("exceljs");
const { DateTime } = require("luxon");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  getStorage,
} = require("firebase/storage");
const config = require("../db/firebase.config.js");
const { differenceInDays } = require("date-fns");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carpool.orane@gmail.com",
    pass: "fnfdogkfijqjcemv",
  },
});

const writeFileAsync = promisify(fs.writeFile);

const app = initializeApp(config.firebaseConfig);

// Get a reference to the Firebase Storage service
const storage = getStorage(app);

const generateTripRequestExcelReport = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      include: {
        plant_uuid: { select: { plant_name: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });

    if (tripRequests.length === 0) {
      return res.status(404).send("No trip requests found");
    }

    const columnMapping = {
      plant_name: "Plant Name",
      request_number: "Request Number",
      UserId: "Requestor Employee ID",
      requesterName: "Requestor's Full Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      purpose: "Purpose",
      department: "Department",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Start Date",
      start_time: "Time From",
      end_date: "End Date",
      num_days: "Number of Days",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      status: "Status",
      comments: "Comments",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      updated_by: "Approved By",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Trip Requests");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "requesterName") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=trip_requests_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `trip_requests_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generateTripRequestExcelReportMail = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      include: {
        plant_uuid: { select: { plant_name: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });

    if (tripRequests.length === 0) {
      return res.status(404).send("No trip requests found");
    }

    const columnMapping = {
      plant_name: "Plant Name",
      request_number: "Request Number",
      UserId: "Requestor Employee ID",
      requesterName: "Requestor's Full Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      purpose: "Purpose",
      department: "Department",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Start Date",
      start_time: "Time From",
      end_date: "End Date",
      num_days: "Number of Days",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      status: "Status",
      comments: "Comments",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      updated_by: "Approved By",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Trip Requests");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "requesterName") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=trip_requests_report.xlsx"
    );

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const assignedVehicleExcelReport = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        assigned_car_id: {
          not: null,
          not: "",
        },
      },
      include: {
        //plant_uuid: { select: { plant_name: true } },
        // user: { select: { name: true, designation: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });

    if (tripRequests.length === 0) {
      return res.status(404).send("No trip requests found");
    }

    // Define a mapping of column names
    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      UserId: "Requestor Employee ID",
      //user_name: "Requestor Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      vehicle_plate: "Vehicle Lisence Plate",
      vehicle_description: "Vehicle Description",
      sap_driver_id: "Driver Employee ID",
      Driver_Name: "Driver Name",
      Driver_Contact_No: "Driver Contact No.",
      purpose: "Purpose",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Date From", // New header for start date
      start_time: "Time From", // New header for start time
      end_date: "Date To",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      totalDistanceCovered: "Total Distance",
      uom: "UoM",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      updated_by: "Approved Status",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "vehicle_plate") {
          return tripRequest?.assigned_car?.vehicle_plate || "";
        } else if (header === "vehicle_description") {
          return tripRequest?.assigned_car?.vehicle_description || "";
        } else if (header === "sap_driver_id") {
          return tripRequest?.assigned_driver?.sap_driver_id || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = defaultColumnWidth;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=assigned_vehicle_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `assigned_vehicle_report${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const assignedVehicleExcelReportMail = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        assigned_car_id: {
          not: null,
          not: "",
        },
      },
      include: {
        //plant_uuid: { select: { plant_name: true } },
        // user: { select: { name: true, designation: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });

    if (tripRequests.length === 0) {
      return res.status(404).send("No trip requests found");
    }

    // Define a mapping of column names
    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      UserId: "Requestor Employee ID",
      //user_name: "Requestor Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      vehicle_plate: "Vehicle Lisence Plate",
      vehicle_description: "Vehicle Description",
      sap_driver_id: "Driver Employee ID",
      Driver_Name: "Driver Name",
      Driver_Contact_No: "Driver Contact No.",
      purpose: "Purpose",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Date From", // New header for start date
      start_time: "Time From", // New header for start time
      end_date: "Date To",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      totalDistanceCovered: "Total Distance",
      uom: "UoM",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      updated_by: "Approved By",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "vehicle_plate") {
          return tripRequest?.assigned_car?.vehicle_plate || "";
        } else if (header === "vehicle_description") {
          return tripRequest?.assigned_car?.vehicle_description || "";
        } else if (header === "sap_driver_id") {
          return tripRequest?.assigned_driver?.sap_driver_id || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = defaultColumnWidth;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=assigned_vehicle_report.xlsx"
    );

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generatefeedBackReport = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        status: "Completed",
      },
      include: {
        plant_uuid: { select: { plant_name: true } },
        // user: { select: { name: true, designation: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });
    console.log("feed_back----------------", tripRequests);
    if (tripRequests.length === 0) {
      return res.status(404).send("No trip feedback found");
    }

    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      plant_name: "Plant Name",
      UserId: "Requestor Employee ID",
      user_name: "Requestor Name",
      vehicle_plate: "Vehicle Lisence Plate",
      DriverId: "Driver Employee ID",
      Driver_Name: "Driver Name",
      start_date: "Date From", // New header for start date
      start_time: "Time From", // New header for start time
      end_date: "Date To", // New header for end date
      end_time: "Time To", // New header for end time
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      feedback_message: "Feed Back Comments",
      rating: "Rating",
      CreatedBy: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "vehicle_plate") {
          return tripRequest?.assigned_car?.vehicle_plate || "";
        } else if (header === "DriverId") {
          console.log(
            "======>>>>>>>>>>>>>>>>>>>>>>>>>",
            tripRequest?.assigned_driver?.driver_id
          );
          return tripRequest?.assigned_driver?.driver_id || "";
        } else if (header === "CreatedBy") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=feed_back_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `feedback_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generatefeedBackReportMail = async (req, res) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        status: "Completed",
      },
      include: {
        plant_uuid: { select: { plant_name: true } },
        // user: { select: { name: true, designation: true } },
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });
    console.log("feed_back----------------", tripRequests);
    if (tripRequests.length === 0) {
      return res.status(404).send("No trip feedback found");
    }

    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      plant_name: "Plant Name",
      UserId: "Requestor Employee ID",
      user_name: "Requestor Name",
      vehicle_plate: "Vehicle Lisence Plate",
      DriverId: "Driver Employee ID",
      Driver_Name: "Driver Name",
      start_date: "Date From",
      start_time: "Time From",
      end_date: "Date To",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      feedback_message: "Feed Back Comments",
      rating: "Rating",
      CreatedBy: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "UserId") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "vehicle_plate") {
          return tripRequest?.assigned_car?.vehicle_plate || "";
        } else if (header === "DriverId") {
          console.log(
            "======>>>>>>>>>>>>>>>>>>>>>>>>>",
            tripRequest?.assigned_driver?.driver_id
          );
          return tripRequest?.assigned_driver?.driver_id || "";
        } else if (header === "CreatedBy") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=feed_back_report.xlsx"
    );

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generateDriverListExcel = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        current_vehicle: true,
        shift: true,
        plant_uuid: true,
      },
    });
    console.log("***********************DriversList", drivers);
    if (drivers.length === 0) {
      return res.status(404).send("No driver List found");
    }

    const columnMapping = {
      sap_driver_id: "Driver ID",
      driver_type: "Driver Type",
      name: "Driver Full Name",
      sex: "Gender",
      mobile_number: "Contact No.",
      emailId: "E-mail Address",
      vehicle_type: "Type of Vehicles",
      jobgrade: "Job Titles",
      location: "Location",
      plant_uuid: "Plant",
      shift: "Shift",
    };
    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Driver List");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Add data
    drivers.forEach((driver) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return driver?.plant_uuid?.plant_name || "";
        } else if (header.includes("_id")) {
          return driver[header];
        } else if (header === "shift") {
          return driver.shift?.Shift_name || "";
        } else if (header === "vehicle_type") {
          // Convert array to comma-separated string
          return driver[header]?.join(", ") || "";
        } else {
          return driver[header]?.name || driver[header];
        }
      });
      worksheet.addRow(row);
    });
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_list_report.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Driver_Master_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateDriverListExcelMail = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        current_vehicle: true,
        shift: true,
        plant_uuid: true,
      },
    });
    console.log("***********************DriversList", drivers);
    if (drivers.length === 0) {
      return res.status(404).send("No driver List found");
    }

    const columnMapping = {
      sap_driver_id: "Driver ID",
      driver_type: "Driver Type",
      name: "Driver Full Name",
      sex: "Gender",
      mobile_number: "Contact No.",
      emailId: "E-mail Address",
      vehicle_type: "Type of Vehicles",
      jobgrade: "Job Titles",
      location: "Location",
      plant_uuid: "Plant",
      shift: "Shift",
    };
    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Driver List");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Add data
    drivers.forEach((driver) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return driver?.plant_uuid?.plant_name || "";
        } else if (header.includes("_id")) {
          return driver[header];
        } else if (header === "shift") {
          return driver.shift?.Shift_name || "";
        } else if (header === "vehicle_type") {
          // Convert array to comma-separated string
          return driver[header]?.join(", ") || "";
        } else {
          return driver[header]?.name || driver[header];
        }
      });
      worksheet.addRow(row);
    });
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_list_report.xlsx"
    );

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const shiftListExcelReport = async (req, res) => {
  try {
    // Fetch data from the database (replace this with your actual database connection)
    const shiftList = await prisma.shiftsMaster.findMany();
    console.log("1111111111111111111111111111111111111111", shiftList);
    // Custom column mapping
    const columnMapping = {
      Shift_ID: "Shift ID",
      sap_shift_id: "SAP Shift ID",
      StartTime: "Start Time",
      EndTime: "End Time",
      Shift_name: "Shift Name",
      Validity_Start: "Validity Start",
      Validity_End: "Validity End",
    };

    // Create a workbook and add a worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Shifts");

    // Add headers to the worksheet
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    // Add data to the worksheet
    shiftList.forEach((shift) => {
      const rowData = Object.values(shift).map((value) => {
        // Convert date to a formatted string
        return value instanceof Date
          ? DateTime.fromJSDate(value).toFormat("yyyy-MM-dd HH:mm:ss")
          : value;
      });
      console.log("000000000000000000000000000000000", rowData);
      worksheet.addRow(rowData);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
      if (headers[index].toLowerCase().includes("date")) {
        column.numFmt = "yyyy-mm-dd HH:mm:ss"; // Adjust the date format as needed
      }
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=shift_list_report.xlsx"
    );

    const filename = `shift_master_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const shiftListExcelReportMail = async (req, res) => {
  try {
    // Fetch data from the database (replace this with your actual database connection)
    const shiftList = await prisma.shiftsMaster.findMany();
    console.log("1111111111111111111111111111111111111111", shiftList);
    // Custom column mapping
    const columnMapping = {
      Shift_ID: "Shift ID",
      sap_shift_id: "SAP Shift ID",
      StartTime: "Start Time",
      EndTime: "End Time",
      Shift_name: "Shift Name",
      Validity_Start: "Validity Start",
      Validity_End: "Validity End",
    };

    // Create a workbook and add a worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Shifts");

    // Add headers to the worksheet
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    // Add data to the worksheet
    shiftList.forEach((shift) => {
      const rowData = Object.values(shift).map((value) => {
        // Convert date to a formatted string
        return value instanceof Date
          ? DateTime.fromJSDate(value).toFormat("yyyy-MM-dd HH:mm:ss")
          : value;
      });
      console.log("000000000000000000000000000000000", rowData);
      worksheet.addRow(rowData);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
      if (headers[index].toLowerCase().includes("date")) {
        column.numFmt = "yyyy-mm-dd HH:mm:ss"; // Adjust the date format as needed
      }
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=shift_list_report.xlsx"
    );

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const generateTripRequestExcelFilterReport = async (req, res) => {
  try {
    const { startDate, endDate, plantId } = req.body;
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        start_time: {
          gte: startDateISO,
          lte: endDateISO,
        },
        plant_uuid_id: plantId,
      },
      include: {
        plant_uuid: true,
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });
    console.log("*******************************", tripRequests);
    if (tripRequests.length === 0) {
      return res.status(404).send("No Filter_trip requests found");
    }

    // Define a mapping of column names
    const columnMapping = {
      plant_name: "Plant Name",
      request_number: "Request Number",
      sap_user_id: "Requestor Employee ID",
      user_name: "Requestor's Full Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      purpose: "Purpose",
      department: "Department",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Start Date",
      start_time: "Time From",
      end_date: "End Date",
      num_days: "Number of Days",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      status: "Status",
      comments: "Comments",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      approved_by_manager: "Approved By",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Trip Requests");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "sap_user_id") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=trip_requests_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Filtered_trip_requests_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const assignedVehicleExcelFilterReport = async (req, res) => {
  try {
    const { startDate, endDate, plantId } = req.body;
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();
    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        start_time: {
          gte: startDateISO,
          lte: endDateISO,
        },
        assigned_car_id: {
          not: null,
          not: "",
        },
        plant_uuid_id: plantId,
      },
      include: {
        plant_uuid: true,
        user: true,
        assigned_car: true,
        assigned_driver: true,
      },
    });
    if (tripRequests.length === 0) {
      return res.status(404).send("No trip requests found");
    }

    // Define a mapping of column names
    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      sap_user_id: "Requestor Employee ID",
      user_name: "Requestor Name",
      designation: "Designation",
      vehicle_type: "Vehicle Type",
      vehicle_plate: "Vehicle Lisence Plate",
      vehicle_description: "Vehicle Description",
      sap_driver_id: "Driver Employee ID",
      Driver_Name: "Driver Name",
      Driver_Contact_No: "Driver Contact No.",
      purpose: "Purpose",
      priority: "Priority",
      passengers_number: "No. Of Passengers",
      people: "Name of Passengers",
      start_date: "Date From",
      start_time: "Time From",
      end_date: "Date To",
      end_time: "Time To",
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      totalDistanceCovered: "Total Distance",
      uom: "UoM",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
      ApprovedBy: "Approved By",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "sap_user_id") {
          return tripRequest?.user?.sap_user_id || "";
        } else if (header === "designation") {
          return tripRequest?.user?.designation || ""; // Access user.designation
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "vehicle_plate") {
          return tripRequest?.assigned_car?.vehicle_plate || "";
        } else if (header === "vehicle_description") {
          return tripRequest?.assigned_car?.vehicle_description || "";
        } else if (header === "sap_driver_id") {
          return tripRequest?.assigned_driver?.sap_driver_id || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = defaultColumnWidth;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=assigned_vehicle_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Filtered_AssignedVehicle_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generateFeedBackFilterReport = async (req, res) => {
  try {
    const { startDate, endDate, plantId } = req.body;

    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();

    const tripRequests = await prisma.tripRequest.findMany({
      where: {
        start_time: {
          gte: startDateISO,
          lte: endDateISO,
          status: "Completed",
        },
        plant_uuid_id: plantId,
      },
      include: {
        plant_uuid: { select: { plant_name: true } },
        user: { select: { name: true, designation: true } },
        assigned_car: true,
        assigned_driver: true,
      },
    });

    console.log("feed_back----------------", tripRequests);

    if (tripRequests.length === 0) {
      return res.status(404).send("No trip feedback found");
    }

    const columnMapping = {
      assignment_number: "Assignment Number",
      request_number: "Request Number",
      plant_name: "Plant Name",
      sap_user_id: "Requestor Employee ID",
      user_name: "Requestor Name",
      vehicle_plate: "Vehicle Lisence Plate",
      sap_driver_id: "Driver Employee ID",
      Driver_Name: "Driver Name",
      start_date: "Date From", // New header for start date
      start_time: "Time From", // New header for start time
      end_date: "Date To", // New header for end date
      end_time: "Time To", // New header for end time
      from_destination: "Location From",
      to_destination: "Location To",
      pickup_point: "Pickup Point",
      drop_point: "Drop Point",
      trip_type: "Trip",
      feedback_message: "Feed Back Comments",
      rating: "Rating",
      user_name: "Created By",
      created_on: "Created At",
      ChangedBy: "Changed By",
      ChangedAt: "Changed At",
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Assigned Vehicle");

    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    tripRequests.forEach((tripRequest) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "plant_uuid") {
          return tripRequest[header]?.plant_name || tripRequest[header];
        } else if (header.includes("_id")) {
          return tripRequest[header];
        } else if (header === "plant_name") {
          return tripRequest?.plant_uuid?.plant_name || "";
        } else if (header === "user_name") {
          return tripRequest?.user?.name || ""; // Access user.name
        } else if (header === "Driver_Name") {
          return tripRequest?.assigned_driver?.name || "";
        } else if (header === "Driver_Contact_No") {
          return tripRequest?.assigned_driver?.mobile_number || "";
        } else if (header === "start_date") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[0]
            : "";
        } else if (header === "start_time") {
          return tripRequest.start_time
            ? tripRequest.start_time.toISOString().split("T")[1]
            : "";
        } else if (header === "uom") {
          return "KM";
        } else if (header === "end_date") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[0]
            : "";
        } else if (header === "num_days") {
          return tripRequest?.number_of_Days || "0";
        } else if (header === "end_time") {
          return tripRequest.end_time
            ? tripRequest.end_time.toISOString().split("T")[1]
            : "";
        } else if (header === "people") {
          return tripRequest[header].join(", ");
        } else {
          return tripRequest[header]?.name || tripRequest[header];
        }
      });
      worksheet.addRow(row);
    });

    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=feed_back_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Filtered_feedback_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};

const fuelReport = async (req, res) => {
  try {
    const fuelList = await prisma.fuel.findMany({
      include: {
        assigned_driver: true,
        trip_uuid: {
          include: {
            assigned_car: true,
          },
        },
      },
    });
    // console.log("***********************DriversList", fuelList);
    if (fuelList.length === 0) {
      return res.status(404).send("No driver List found");
    }

    // res.status(200).json(fuelList);

    const columnMapping = {
      trip_id: "Request Number",
      lisence_plate: "Vehicle Lisence Plate",
      driver_id: "Driver ID",
      date: "Date",
      currentReading: "Current Reading",
      currentReadingImage: "Odometer Reading",
      fuelLoaded: "Fuel Amount",
      invoiceImage: "Reciept Picture",
      fuelStationLocation: "Location",
    };
    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Fuel List");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Add data
    fuelList.forEach((fuel) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "trip_id") {
          return fuel?.trip_uuid?.request_number || "";
        } else if (header === "lisence_plate") {
          return fuel?.trip_uuid?.assigned_car?.vehicle_plate || "";
        } else if (header === "driver_id") {
          return fuel?.assigned_driver?.sap_driver_id || "";
        } else if (header === "date") {
          return fuel?.trip_uuid?.start_time.toISOString().split("T")[0] || "";
        } else if (header === "current_Reading") {
          return fuel?.trip_uuid?.start_time.toISOString().split("T")[0] || "";
        } else {
          return fuel[header]?.name || fuel[header];
        }
      });
      worksheet.addRow(row);
    });
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_list_report.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Fuel_Expanses${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const busDetailsReport = async (req, res) => {
  try {
    // Fetch data from the database based on your requirements
    const busesWithRoutes = await prisma.bus.findMany({
      include: {
        routes: true,
      },
    });

    // Create a new Excel workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Bus Report");

    // Define column headers
    worksheet.columns = [
      //{ header: 'Bus ID', key: 'busId', width: 15 },
      //{ header: 'SAP Bus ID', key: 'sapBusId', width: 15 },
      {
        header: "Bus Registration Number",
        key: "busRegistrationNumber",
        width: 20,
      },
      { header: "Vehicle Owner ID", key: "vehicle_owner_id", width: 20 },
      { header: "Bus Name", key: "busName", width: 20 },
      { header: "Bus Description", key: "busDescription", width: 20 },
      //{ header: 'Bus Route ID', key: 'busRouteId', width: 15 },
      { header: "Bus Route Name", key: "busRouteName", width: 20 },
      { header: "Bus To Office", key: "busToOffice", width: 20 },
      { header: "Bus To Home", key: "busToHome", width: 20 },
    ];

    // Populate data rows
    busesWithRoutes.forEach((bus) => {
      bus.routes.forEach((route) => {
        worksheet.addRow({
          busId: bus.busId,
          sapBusId: bus.sapBusId || "",
          busRegistrationNumber: bus.busRegistrationNumber || "",
          vehicle_owner_id: bus.vehicle_owner_id || "",
          busName: bus.busName || "",
          busDescription: bus.busDescription || "",
          busRouteId: route.busRouteId,
          busRouteName: route.busRouteName,
          busToOffice: route.busToOffice || "",
          busToHome: route.busToHome || "",
        });
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bus_report.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `bus_detail_report_${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handoverRecieveExcelReport = async (req, res) => {
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
    const columnMapping = {
      vehicle_plate: "Fleet (License Plate)",
      vehicle_description: "Fleet Description",
      from_driver_id: "From Driver ID",
      from_driver_name: "From Driver Name",
      from_driver_type: "From Driver Type",
      to_driver_id: "To Driver ID",
      to_driver_name: "To Driver Name",
      to_driver_type: "To Driver Type",
      odometer_reading: "Odometer Reading",
      vehicle_status: "Body Condition",
      fuelReading: "Fuel Amount In Tank",
      created_by: "Created By",
      created_at: "Created At",
      changed_by: "Changed By",
      changed_at: "Changed At",
      //approved_by: 'Approved Status',
    };
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("VehicleHandover Report");

    // Add headers based on custom column mapping
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Add data rows
    vehicleHandovers.forEach((handover) => {
      const rowData = {
        vehicle_plate:
          handover.from_driver.current_vehicle?.vehicle_plate || "", // Check if current_vehicle is defined
        vehicle_description:
          handover.from_driver.current_vehicle?.vehicle_description || "",
        from_driver_id: handover.from_driver.sap_driver_id,
        from_driver_name: handover.from_driver.name || "",
        from_driver_type: handover.from_driver.driver_type || "Contract",
        to_driver_id: handover.to_driver.sap_driver_id,
        to_driver_name: handover.to_driver.name || "",
        to_driver_type: handover.to_driver.driver_type || "Permanent",
        odometer_reading: handover.odometer_reading || "200",
        vehicle_status: handover.handover_status,
        fuelReading: handover.hadnoverRecieve?.fuelReading || "6",
        created_by: handover.created_by || "Admin",
        created_at: handover.created_on,
        changed_by: handover.changed_by,
        changed_at: handover.updated_at,
        approved_by: handover.approved_status || "",
      };

      worksheet.addRow(Object.values(rowData));
    });

    // Set content type and headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=VehicleHandoverReport.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `handover_receive_report${uuidv4()}.xlsx`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, buffer2);

    const snapshot = await uploadTask;

    const downloadURL = await getDownloadURL(snapshot.ref);

    res.status(200).json({ downloadURL });
    // Write the workbook to the response
    //await workbook.xlsx.write(res);

    // res.status(200).end();
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fuelReportMail = async (req, res) => {
  try {
    const fuelList = await prisma.fuel.findMany({
      include: {
        assigned_driver: true,
        trip_uuid: {
          include: {
            assigned_car: true,
          },
        },
      },
    });
    // console.log("***********************DriversList", fuelList);
    if (fuelList.length === 0) {
      return res.status(404).send("No driver List found");
    }

    // res.status(200).json(fuelList);

    const columnMapping = {
      trip_id: "Request Number",
      lisence_plate: "Vehicle Lisence Plate",
      driver_id: "Driver ID",
      date: "Date",
      currentReading: "Current Reading",
      currentReadingImage: "Odometer Reading",
      fuelLoaded: "Fuel Amount",
      invoiceImage: "Reciept Picture",
      fuelStationLocation: "Location",
    };
    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Fuel List");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Add data
    fuelList.forEach((fuel) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "trip_id") {
          return fuel?.trip_uuid?.request_number || "";
        } else if (header === "lisence_plate") {
          return fuel?.trip_uuid?.assigned_car?.vehicle_plate || "";
        } else if (header === "driver_id") {
          return fuel?.assigned_driver?.sap_driver_id || "";
        } else if (header === "date") {
          return fuel?.trip_uuid?.start_time.toISOString().split("T")[0] || "";
        } else if (header === "current_Reading") {
          return fuel?.trip_uuid?.start_time.toISOString().split("T")[0] || "";
        } else {
          return fuel[header]?.name || fuel[header];
        }
      });
      worksheet.addRow(row);
    });
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set content type and headers for Excel file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=driver_list_report.xlsx"
    );
    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const busDetailsReportMail = async (req, res) => {
  try {
    // Fetch data from the database based on your requirements
    const busesWithRoutes = await prisma.bus.findMany({
      include: {
        routes: true,
      },
    });

    // Create a new Excel workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Bus Report");

    // Define column headers
    worksheet.columns = [
      //{ header: 'Bus ID', key: 'busId', width: 15 },
      //{ header: 'SAP Bus ID', key: 'sapBusId', width: 15 },
      {
        header: "Bus Registration Number",
        key: "busRegistrationNumber",
        width: 20,
      },
      { header: "Vehicle Owner ID", key: "vehicle_owner_id", width: 20 },
      { header: "Bus Name", key: "busName", width: 20 },
      { header: "Bus Description", key: "busDescription", width: 20 },
      //{ header: 'Bus Route ID', key: 'busRouteId', width: 15 },
      { header: "Bus Route Name", key: "busRouteName", width: 20 },
      { header: "Bus To Office", key: "busToOffice", width: 20 },
      { header: "Bus To Home", key: "busToHome", width: 20 },
    ];

    // Populate data rows
    busesWithRoutes.forEach((bus) => {
      bus.routes.forEach((route) => {
        worksheet.addRow({
          busId: bus.busId,
          sapBusId: bus.sapBusId || "",
          busRegistrationNumber: bus.busRegistrationNumber || "",
          vehicle_owner_id: bus.vehicle_owner_id || "",
          busName: bus.busName || "",
          busDescription: bus.busDescription || "",
          busRouteId: route.busRouteId,
          busRouteName: route.busRouteName,
          busToOffice: route.busToOffice || "",
          busToHome: route.busToHome || "",
        });
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bus_report.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer2,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handoverRecieveExcelReportMail = async (req, res) => {
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
    const columnMapping = {
      vehicle_plate: "Fleet (License Plate)",
      vehicle_description: "Fleet Description",
      from_driver_id: "From Driver ID",
      from_driver_name: "From Driver Name",
      from_driver_type: "From Driver Type",
      to_driver_id: "To Driver ID",
      to_driver_name: "To Driver Name",
      to_driver_type: "To Driver Type",
      odometer_reading: "Odometer Reading",
      vehicle_status: "Body Condition",
      fuelReading: "Fuel Amount In Tank",
      created_by: "Created By",
      created_at: "Created At",
      changed_by: "Changed By",
      changed_at: "Changed At",
      //approved_by: 'Approved Status',
    };
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("VehicleHandover Report");

    // Add headers based on custom column mapping
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);
    // Set a default width for all columns
    const defaultColumnWidth = 15;
    headers.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
      column.width = defaultColumnWidth;
    });
    // Add data rows
    vehicleHandovers.forEach((handover) => {
      const rowData = {
        vehicle_plate:
          handover.from_driver.current_vehicle?.vehicle_plate || "", // Check if current_vehicle is defined
        vehicle_description:
          handover.from_driver.current_vehicle?.vehicle_description || "",
        from_driver_id: handover.from_driver.sap_driver_id,
        from_driver_name: handover.from_driver.name || "",
        from_driver_type: handover.from_driver.driver_type || "Contract",
        to_driver_id: handover.to_driver.sap_driver_id,
        to_driver_name: handover.to_driver.name || "",
        to_driver_type: handover.to_driver.driver_type || "Permanent",
        odometer_reading: handover.odometer_reading || "200",
        vehicle_status: handover.handover_status,
        fuelReading: handover.hadnoverRecieve?.fuelReading || "6",
        created_by: handover.created_by || "Admin",
        created_at: handover.created_on,
        changed_by: handover.changed_by,
        changed_at: handover.updated_at,
        approved_by: handover.approved_status || "",
      };

      worksheet.addRow(Object.values(rowData));
    });

    // Set content type and headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=VehicleHandoverReport.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const mailOptions = {
      from: "carpool.orane@gmail.com",
      to: "allenv213@gmail.com",
      subject: "Trip Requests Report",
      text: "Please find the attached trip requests report.",
      attachments: [
        {
          filename: "trip_requests_report.xlsx",
          content: buffer2,
          encoding: "base64",
        },
      ],
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
    // Write the workbook to the response
    //await workbook.xlsx.write(res);

    // res.status(200).end();
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  generateTripRequestExcelReport,
  assignedVehicleExcelReport,
  generatefeedBackReport,
  handoverRecieveExcelReport,
  generateTripRequestExcelFilterReport,
  assignedVehicleExcelFilterReport,
  generateFeedBackFilterReport,
  busDetailsReport,
  shiftListExcelReport,
  generateDriverListExcel,
  fuelReport,

  generateTripRequestExcelReportMail,
  assignedVehicleExcelReportMail,
  generatefeedBackReportMail,
  generateDriverListExcelMail,
  shiftListExcelReportMail,
  handoverRecieveExcelReportMail,
  busDetailsReportMail,
  fuelReportMail,
};
