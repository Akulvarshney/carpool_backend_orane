const express = require("express");
const {
  signupEmpMan,
  register_User,
  fetchUserDetailUserId,
  login,
  firstTimePassword,
} = require("../controllers/LoginSignupController");
const { addPlant, plantList } = require("../controllers/PlantController");
const {
  addDriver,
  fetchDriverList,
  fetchAllUnlinkedVehicle,
  changeShiftOrVehicle,
  // addOrUpdateDriverMaster,
} = require("../controllers/DriverController");
const { addShift, shiftList } = require("../controllers/ShiftController");
const {
  requestTrip,
  allUsers,
  recentTripUserId,
  tripDetail,
  feedback,
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
} = require("../controllers/TripController");
const {
  authenticateToken,
  basicAuthMiddleware,
} = require("../utils/jwtAuthVerify");
const {
  createVehicleOwner,
  createNewVehicle,
  getAllVehicle,
  findAvailableVehicle,
  allVehicleOwner,
} = require("../controllers/VehicleController");
const {
  fetchPlantsSap,
  fetchShiftSap,
  importUserSap,
  importDriverSap,
  importVehicleSap,
  importVehicleOwnerSap,
} = require("../controllers/sap_integration_controller");
const {
  handOverApi,
  handoverHistorywithdriverId,
  receiveApi,
  fetchAllHandoverTransactions,
  createHandoverTransaction,
  createHandoverRecieveRecord,
  fetchDriverBasedHandoverTransaction,
} = require("../controllers/HandoverReceive");
const {
  addBus,
  addBusRoutes,
  fetchBusList,
  getStopByBusId,
  deleteStopsByBusId,
  deleteBusById,
  updateBusDetail,
  addRoutes2,
  fetchRoutesofBus,
} = require("../controllers/BusController");
const { addFuel, driverFuelList } = require("../controllers/FuelController");
const {
  generateTripRequestExcelReport,
  assignedVehicleExcelReport,
  generatefeedBackReport,
  generateDriverListExcel,
  handoverRecieveExcelReport,
  shiftListExcelReport,
  generateTripRequestExcelFilterReport,
  assignedVehicleExcelFilterReport,
  fuelReport,
} = require("../controllers/ReportsController");
const { uploadImage } = require("../controllers/UploadImageController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// router.route("/allUsers").get(authenticateToken, allUsers);

router.route("/login").post(login);
router.route("/signupEmp").post(signupEmpMan);
router.route("/registrationEmp").post(register_User);
router.route("/firstTimePassword").put(firstTimePassword);
router.route("/addPlant").post(addPlant);
router.route("/plantList").get(plantList);
router.route("/addShift").post(addShift);
router.route("/shiftList").get(shiftList);
router.route("/addDriver").post(addDriver);
router.route("/allUsers").get(allUsers);
router.route("/requestTrip").post(requestTrip);
router.route("/recentTripUserId").get(recentTripUserId);
router.route("/tripDetail/:trip_id").get(tripDetail);
router.route("/feedback/:trip_id").post(feedback);
router.route("/userDetail/:user_id").get(fetchUserDetailUserId);
router.route("/fetchTripsWithStatus").get(fetchTripsWithStatus);
router.route("/fetchDriverList").get(fetchDriverList);
router.route("/updateStatus/:tripId").post(updateStatus);
// router.route("/findDriver").post(findDriver);
router.route("/approvingTrip").put(approvingTrip);
router.route("/createNewVehicle").post(createNewVehicle);
router.route("/getAllVehicle").get(getAllVehicle);
// router.route("/findAvailableVehicle").post(findAvailableVehicle);
// router.route("/cancelLesson/:tripId").post(cancelLesson);
router.route("/driverActualTripTiming/:tripId").post(driverActualTripTiming);
router.route("/approveByManager/:tripId").put(approveByManager);
router.route("/getTripForDriver/:driverId").get(getTripForDriver);
router.route("/fleetAssigningTrips").post(fleetAssigningTrips);
router.route("/managerApprovalTrips").get(managerApprovalTrips);
router.route("/findAvailableVehicle2").post(findAvailableVehicle2);
router.route("/freeVehicle").get(fetchAllUnlinkedVehicle);
router.route("/changeShiftOrVehicle").put(changeShiftOrVehicle);
router.route("/assignedVehicle").post(assignedVehicle);
router.route("/allVehicleOwner").get(allVehicleOwner);

//Handover and Recieve
router.route("/handOver").post(handOverApi);
router.route("/receiveApi").post(receiveApi);
router
  .route("/handoverHistorywithdriverId/:driver_id")
  .get(handoverHistorywithdriverId);
router.route("/createHandoverTransaction").post(createHandoverTransaction);
router.route("/fetchAllHandoverTransactions").get(fetchAllHandoverTransactions);
router.route("/createHandoverRecieveRecord").post(createHandoverRecieveRecord);
router
  .route("/fetchDriverBasedHandoverTransaction/:driverId")
  .get(fetchDriverBasedHandoverTransaction);

//SAP
router.route("/sap/fetchPlantsSap").post(basicAuthMiddleware, fetchPlantsSap);
router.route("/sap/fetchShiftSap").post(basicAuthMiddleware, fetchShiftSap);
router.route("/sap/importUserSap").post(basicAuthMiddleware, importUserSap);
router.route("/sap/importDriverSap").post(basicAuthMiddleware, importDriverSap);
router
  .route("/sap/importVehicleSap")
  .post(basicAuthMiddleware, importVehicleSap);
router
  .route("/sap/importVehicleOwnerSap")
  .post(basicAuthMiddleware, importVehicleOwnerSap);

//Bus
router.route("/addBus").post(addBus);
router.route("/addBusRoutes").post(addBusRoutes);
router.route("/addRoutes2/:busId").post(addRoutes2);
router.route("/fetchRoutesofBus/:busId").get(fetchRoutesofBus);
router.route("/fetchBusList").get(fetchBusList);
router.route("/deleteStopsByBusId").delete(deleteStopsByBusId);
router.route("/deleteBusById").delete(deleteBusById);

//Fuel
router.route("/addFuel").post(addFuel);
router.route("/driverFuelList").post(driverFuelList);

//Reports
router
  .route("/generateTripRequestExcelReport")
  .get(generateTripRequestExcelReport);
router.route("/assignedVehicleExcelReport").get(assignedVehicleExcelReport);
router.route("/generatefeedBackReport").get(generatefeedBackReport);
router.route("/generateDriverListExcel").get(generateDriverListExcel);
router.route("/shiftListExcelReport").get(shiftListExcelReport);
router.route("/handoverRecieveExcelReport").get(handoverRecieveExcelReport);
router.route("/fuelReport").get(fuelReport);

router
  .route("/generateTripRequestExcelFilterReport")
  .post(generateTripRequestExcelFilterReport);
router
  .route("/assignedVehicleExcelFilterReport")
  .post(assignedVehicleExcelFilterReport);

//Upload Image
router.route("/uploadImage").post(upload.single("filename"), uploadImage);

router.route("/createVehicleOwner").post(createVehicleOwner);

module.exports = router;
