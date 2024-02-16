const prisma = require("../db/db.config");
const errorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { v4: uuidv4, validate: isUuid } = require("uuid");
const { promisify } = require("util");
const fs = require("fs");
const excel = require("exceljs");
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

const shiftListExcelReport = async (req, res) => {
  try {
    // Fetch all shifts from the ShiftsMaster table
    const shiftList = await prisma.driver.findMany({
      include: {
        //   current_vehicle: true,
        shift: true,
        //   plant_uuid: true,
      },
    });

    console.log(shiftList);

    // Define a mapping of column names
    const columnMapping = {
      sap_driver_id: "Driver",
      name: "Driver Full Name",
      ValStartTime: "Validity Start date",
      ValEndTime: "Validity End Date",
      Shift_name: "Shift",
      StartTime: "Shift Start Time",
      EndTime: "Shift End Time",
      Availibility: "Availability",
    };

    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("shift List");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    // Add data
    shiftList.forEach((shift) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "Shift_name") {
          return shift?.shift?.Shift_name || "";
        } else if (header === "StartTime") {
          return shift?.shift?.StartTime || "";
        } else if (header === "EndTime") {
          return shift?.shift?.EndTime || "";
        } else {
          return shift[header] || "";
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
      "attachment; filename=shift_list_report.xlsx"
    );

    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `feedback_report_${uuidv4()}.xlsx`;
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
    const handoverRecords = await prisma.handoverReceive.findMany({
      include: { vehicle: true, plant_uuid: true, driver: true },
    });
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", handoverRecords);

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
      // approved_by: 'Approved By',
    };

    // Create a new workbook and worksheet
    //   const workbook = new excel.Workbook();
    //   const worksheet = workbook.addWorksheet("HandoverRecieve_Report");

    //   // Add headers
    //   const headers = Object.values(columnMapping);
    //   worksheet.addRow(headers);

    //   // Add data to the worksheet
    //   handoverRecords.forEach((record) => {
    //     const rowData = Object.keys(columnMapping).map((key) => record[key]);
    //     console.log("rrrrrrrrrrrrrrrr", rowData.length);
    //     worksheet.addRow(rowData);
    //   });
    //   // Set a default width for all columns
    //   const defaultColumnWidth = 15;
    //   headers.forEach((_, index) => {
    //     const column = worksheet.getColumn(index + 1); // Excel columns are 1-indexed
    //     column.width = defaultColumnWidth;
    //   });
    //   // Generate a unique filename for the Excel file
    //   //const filename = `handover_records_all_${Date.now()}.xlsx`;
    //   const filename = `handover_recieve_report.xlsx`;
    //   const filePath = `./${filename}`;

    //   // Save the Excel file
    //   await writeFileAsync(filePath, await workbook.xlsx.writeBuffer());

    //   // Send the file as a response
    //   res.download(filePath, filename, (err) => {
    //     // Clean up the file after it has been sent
    //     if (!err) {
    //       setTimeout(() => {
    //         fs.unlinkSync(filePath);
    //       }, 1000);
    //     }
    //   });
  } catch (error) {
    console.error("Error fetching or generating handover records:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
        plant_uuid_id: plantId, // Assuming plant_uuid_id is the foreign key in the TripRequest model
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
    // Fetch all buses from the Bus table
    const buses = await prisma.bus.findMany();

    // Define a mapping of column names
    const columnMapping = {
      busId: "Bus ID",
      sapBusId: "SAP Bus ID",
      busName: "Bus Name",
      busRegistrationNumber: "Bus Registration Number",
      bus_desciption: "Bus Description",
      vehicle_owner_id: "Vehicle Owner ID",
      bus_route_name: "Bus Route Name",
      bus_stop: "Bus Stop",
    };

    // Create a new workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Bus Report");

    // Add headers
    const headers = Object.values(columnMapping);
    worksheet.addRow(headers);

    // Add data
    buses.forEach((bus) => {
      const row = Object.keys(columnMapping).map((header) => {
        if (header === "bus_stop" && bus[header]) {
          return JSON.stringify(bus[header]); // Convert JSON object to a string
        } else {
          return bus[header] !== null && bus[header] !== undefined
            ? bus[header].toString()
            : "";
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
      "attachment; filename=bus_report.xlsx"
    );
    const buffer2 = await workbook.xlsx.writeBuffer();

    const filename = `Filtered_feedback_report_${uuidv4()}.xlsx`;
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
};
