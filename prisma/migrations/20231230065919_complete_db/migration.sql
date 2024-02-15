-- CreateTable
CREATE TABLE "Auth" (
    "authentication_id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("authentication_id")
);

-- CreateTable
CREATE TABLE "PlantMaster" (
    "plant_uuid_id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,

    CONSTRAINT "PlantMaster_pkey" PRIMARY KEY ("plant_uuid_id")
);

-- CreateTable
CREATE TABLE "ShiftsMaster" (
    "Shift_ID" TEXT NOT NULL,
    "StartTime" TIMESTAMP(3) NOT NULL,
    "EndTime" TIMESTAMP(3) NOT NULL,
    "Shift_name" TEXT NOT NULL,

    CONSTRAINT "ShiftsMaster_pkey" PRIMARY KEY ("Shift_ID")
);

-- CreateTable
CREATE TABLE "Users" (
    "user_id" TEXT NOT NULL,
    "authentication_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "triprequested" INTEGER NOT NULL DEFAULT 0,
    "designation" VARCHAR(50),
    "dob" DATE,
    "profile_image" VARCHAR(255),
    "mobile_number" VARCHAR(15),
    "role" VARCHAR(50),
    "employee_Id" VARCHAR(50),
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "VehicleOwner" (
    "vehicle_owner_id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "VehicleOwner_pkey" PRIMARY KEY ("vehicle_owner_id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicle_id" TEXT NOT NULL,
    "vehicle_plate" VARCHAR(20) NOT NULL,
    "vehicle_type" VARCHAR(50) NOT NULL,
    "vehicle_description" VARCHAR(255) NOT NULL,
    "vehicle_owner_id" TEXT NOT NULL,
    "vehicle_status" VARCHAR(50) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "driver_id" TEXT NOT NULL,
    "authentication_id" TEXT NOT NULL,
    "driver_employee_id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "vehicle_type" TEXT[],
    "name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "plant_uuid_id" TEXT NOT NULL,
    "jobgrade" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,
    "trips_completed" INTEGER NOT NULL DEFAULT 0,
    "dob" TIMESTAMP(3) NOT NULL,
    "profile_image" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_vehicle_id" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("driver_id")
);

-- CreateTable
CREATE TABLE "TripRequest" (
    "trip_id" TEXT NOT NULL,
    "plant_uuid_id" TEXT NOT NULL,
    "request_number" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "passengers_number" INTEGER NOT NULL,
    "people" TEXT[],
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "from_destination" TEXT NOT NULL,
    "to_destination" TEXT NOT NULL,
    "pickup_point" TEXT NOT NULL,
    "trip_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "approved_by_manager" BOOLEAN NOT NULL,
    "assigned_car_id" TEXT NOT NULL,
    "assigned_driver_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripRequest_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "HandoverReceive" (
    "id" TEXT NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "comments" TEXT,
    "status" TEXT NOT NULL,
    "vehicle_photos" TEXT[],
    "form_photo" TEXT,

    CONSTRAINT "HandoverReceive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "maintenanceId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "maintenance_time" TIMESTAMP(3) NOT NULL,
    "maintenance_message" TEXT NOT NULL,
    "maintenance_status" TEXT NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("maintenanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_emailId_key" ON "Auth"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_authentication_id_key" ON "Users"("authentication_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_employee_Id_key" ON "Users"("employee_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicle_id_key" ON "Vehicle"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_authentication_id_key" ON "Driver"("authentication_id");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_driver_employee_id_key" ON "Driver"("driver_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_current_vehicle_id_key" ON "Driver"("current_vehicle_id");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_authentication_id_fkey" FOREIGN KEY ("authentication_id") REFERENCES "Auth"("authentication_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicle_owner_id_fkey" FOREIGN KEY ("vehicle_owner_id") REFERENCES "VehicleOwner"("vehicle_owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_authentication_id_fkey" FOREIGN KEY ("authentication_id") REFERENCES "Auth"("authentication_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Users"("authentication_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "ShiftsMaster"("Shift_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_current_vehicle_id_fkey" FOREIGN KEY ("current_vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_car_id_fkey" FOREIGN KEY ("assigned_car_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;
