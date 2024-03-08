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
  softDeleteDriver,
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
  forwardedList,
  forwardedTrue,
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
  softDeleteVehicle,
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
  fetchSingleBusInfo,
  fetchRouteDetail,
  updatebusRoute,
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
  busDetailsReport,
  generateTripRequestExcelReportMail,
  assignedVehicleExcelReportMail,
  generatefeedBackReportMail,
  generateDriverListExcelMail,
  shiftListExcelReportMail,
  handoverRecieveExcelReportMail,
  busDetailsReportMail,
  fuelReportMail,
} = require("../controllers/ReportsController");
const { uploadImage } = require("../controllers/UploadImageController");
const multer = require("multer");
const {
  sendRequestFormMail,
  sendRequestForm,
  sendHandoverForm,
} = require("../controllers/mails");
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
router.route("/fetchDriverList/:plantId").get(fetchDriverList);
router.route("/updateStatus/:tripId").post(updateStatus);
router.route("/forwardedTrue/:tripId").post(forwardedTrue);
// router.route("/findDriver").post(findDriver);
router.route("/approvingTrip").put(approvingTrip);
router.route("/createNewVehicle").post(createNewVehicle);
router.route("/getAllVehicle/:plantId").get(getAllVehicle);
// router.route("/findAvailableVehicle").post(findAvailableVehicle);
// router.route("/cancelLesson/:tripId").post(cancelLesson);
router.route("/driverActualTripTiming/:tripId").post(driverActualTripTiming);
router.route("/approveByManager/:tripId").put(approveByManager);
router.route("/getTripForDriver/:driverId").get(getTripForDriver);
router.route("/fleetAssigningTrips").post(fleetAssigningTrips);
router.route("/managerApprovalTrips").get(managerApprovalTrips);
router.route("/forwardedList").get(forwardedList);
router.route("/findAvailableVehicle2").post(findAvailableVehicle2);
router.route("/freeVehicle/:plantId").get(fetchAllUnlinkedVehicle);
router.route("/changeShiftOrVehicle").put(changeShiftOrVehicle);
router.route("/assignedVehicle").post(assignedVehicle);
router.route("/allVehicleOwner").get(allVehicleOwner);
router.route("/softDeleteVehicle").post(softDeleteVehicle);
router.route("/softDeleteDriver").post(softDeleteDriver);

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
router
  .route("/fetchSingleBusInfo/:busId")
  .get(fetchSingleBusInfo)
  .put(updateBusDetail);
router
  .route("/fetchRouteDetail/:busRouteId")
  .get(fetchRouteDetail)
  .put(updatebusRoute);
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
router.route("/busDetailsReport").get(busDetailsReport);

router
  .route("/generateTripRequestExcelReportMail")
  .get(generateTripRequestExcelReportMail);
router
  .route("/assignedVehicleExcelReportMail")
  .get(assignedVehicleExcelReportMail);
router.route("/generatefeedBackReportMail").get(generatefeedBackReportMail);
router.route("/generateDriverListExcelMail").get(generateDriverListExcelMail);
router.route("/shiftListExcelReportMail").get(shiftListExcelReportMail);
router
  .route("/handoverRecieveExcelReportMail")
  .get(handoverRecieveExcelReportMail);
router.route("/busDetailsReportMail").get(busDetailsReportMail);
router.route("/fuelReportMail").get(fuelReportMail);

router
  .route("/generateTripRequestExcelFilterReport")
  .post(generateTripRequestExcelFilterReport);
router
  .route("/assignedVehicleExcelFilterReport")
  .post(assignedVehicleExcelFilterReport);

//Upload Image
router.route("/uploadImage").post(upload.single("filename"), uploadImage);

router.route("/sendRequestFormMail/:authId").get(sendRequestFormMail);

router.route("/createVehicleOwner").post(createVehicleOwner);

router.route("/sendRequestForm/:tripId/:userEmail").get(sendRequestForm);

router.route("/sendHandoverForm/:handoverId/:userEmail").get(sendHandoverForm);

module.exports = router;
