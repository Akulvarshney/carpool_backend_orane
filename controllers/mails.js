const prisma = require("../db/db.config");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");

let template;
fs.readFile(
  path.join(__dirname, "../Assets/table.html"),
  "utf-8",
  (err, data) => {
    if (err) {
      console.error("Error reading template:", err);
      process.exit(1);
    } else {
      template = handlebars.compile(data);
    }
  }
);

let template2;
fs.readFile(
  path.join(__dirname, "../Assets/table2.html"),
  "utf-8",
  (err, data) => {
    if (err) {
      console.error("Error reading template:", err);
      process.exit(1);
    } else {
      template2 = handlebars.compile(data);
    }
  }
);

async function generatePDF(htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function sendEmail(email, subject, body, attachmentFileName) {
  const attachmentFilePath = path.join(__dirname, attachmentFileName);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "carpool.orane@gmail.com",
      pass: "fnfdogkfijqjcemv",
    },
  });

  const attachmentContent = fs.readFileSync(attachmentFilePath);
  const mailOptions = {
    from: "MotorPool",
    to: email,
    subject: subject,
    text: body,
    attachments: [
      {
        filename: path.basename(attachmentFilePath),
        content: attachmentContent,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

const sendHandoverForm = async (req, res) => {
  try {
    const { handoverId, userEmail } = req.params;
    const handoverInfo = await prisma.vehicleHandover.findUnique({
      where: { handover_id: handoverId },
      include: {
        from_driver: true,
        to_driver: true,
        vehicle: true,
        hadnoverRecieve: true,
      },
    });

    if (!handoverInfo) {
      console.error("Handover not found");
      return res.status(500).json({ message: "Handover not found" });
    }

    console.log(handoverInfo);
    const htmlContent = template2({
      time: handoverInfo?.created_on?.toLocaleTimeString(),
      date: handoverInfo?.created_on?.toLocaleDateString(),
      vehicle: handoverInfo?.vehicle?.vehicle_plate,
      fromDriver: handoverInfo?.from_driver?.name?.substring(0, 20),
      fromDriverId: handoverInfo?.from_driver?.sap_driver_id,
      toDriver: handoverInfo?.to_driver?.name?.substring(0, 20),
      toDriverId: handoverInfo?.to_driver?.sap_driver_id,
    });

    const pdfBuffer = await generatePDF(htmlContent);

    const attachmentFileName = `HandoverVehicleForm.pdf`;

    console.log("__dirname:", __dirname);
    console.log("attachmentFileName:", attachmentFileName);

    const attachmentFilePath = `${__dirname}/${attachmentFileName}`;

    console.log("attachmentFilePath:", attachmentFilePath);

    await fs.promises.writeFile(attachmentFilePath, pdfBuffer);

    const emailSubject = "HandOver Recieve Form";
    const emailBody = `Dear Fleet Administrator,
    
    Best regards,
    MotorPool`;

    const attachmentContent = await fs.promises.readFile(attachmentFilePath);

    const sendEmailTo = [
      userEmail,
      handoverInfo?.from_driver?.emailId,
      handoverInfo?.to_driver?.emailId,
    ];

    const mailOptions = {
      from: "MotorPool",
      to: sendEmailTo,
      subject: emailSubject,
      text: emailBody,
      attachments: [
        {
          filename: path.basename(attachmentFilePath),
          content: attachmentContent,
        },
      ],
    };

    await sendEmail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.text,
      attachmentFileName
    );

    await fs.promises.unlink(attachmentFilePath);
    return res.status(200).json({ message: "PDF sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const splitPeopleDetails = (peopleArray) => {
  return peopleArray.map((person) => person.split(", "));
};

const sendRequestForm = async (req, res) => {
  try {
    const { tripId, userEmail } = req.params;

    const tripRequest = await prisma.tripRequest.findFirst({
      where: { trip_id: tripId },
      include: {
        assigned_car: true,
        assigned_driver: true,
        user: true,
      },
    });

    const peopleDetails = splitPeopleDetails(tripRequest?.people || []).map(
      (person) => ({
        passengerID: person[1],
        passengerName: person[0],
        designation: person[2] || "Guest",
      })
    );
    console.log("asd", JSON.stringify(tripRequest, null, 2));

    const htmlContent = template({
      requestNumber: tripRequest?.request_number,
      requestDate: tripRequest?.created_on.toLocaleDateString(),
      tripTo: tripRequest?.to_destination,
      tripPurpose: tripRequest?.purpose,
      startDate: tripRequest?.start_time?.toLocaleDateString(),
      startTime: tripRequest?.start_time?.toLocaleTimeString(),
      endDate: tripRequest?.end_time?.toLocaleDateString(),
      endTime: tripRequest?.end_time?.toLocaleTimeString(),
      people: peopleDetails,
      driverName: tripRequest?.assigned_driver?.name,
      vehicleNumber: tripRequest?.assigned_car?.vehicle_plate,
      vehicleType: tripRequest?.assigned_car?.vehicle_type,
      managerName: tripRequest?.updated_by,
    });

    const pdfBuffer = await generatePDF(htmlContent);

    const attachmentFileName = `trip_request_${tripId}.pdf`;

    console.log("__dirname:", __dirname);
    console.log("attachmentFileName:", attachmentFileName);

    const attachmentFilePath = `${__dirname}/${attachmentFileName}`;

    console.log("attachmentFilePath:", attachmentFilePath);

    await fs.promises.writeFile(attachmentFilePath, pdfBuffer);

    const emailSubject = "Trip Request PDF";
    const emailBody = `Dear Fleet Administrator,
    I trust this message finds you well. This mail is to submit a request form that requires your attention. Attached to this email is a PDF document containing the necessary details for your review and completion.
    
    Please take a moment to review the attached PDF and fill in the required information. Once completed, kindly save the document and return it to me at your earliest convenience.
    
    Thank you for your cooperation.
    
    Best regards,
    MotorPool`;

    const attachmentContent = await fs.promises.readFile(attachmentFilePath);

    const mailOptions = {
      from: "MotorPool",
      to: userEmail,
      subject: emailSubject,
      text: emailBody,
      attachments: [
        {
          filename: path.basename(attachmentFilePath),
          content: attachmentContent,
        },
      ],
    };

    await sendEmail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.text,
      attachmentFileName
    );

    await fs.promises.unlink(attachmentFilePath);
    return res.status(200).json({ message: "PDF sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendRequestFormMail = async (req, res) => {
  try {
    const authId = req.params.authId;

    const user = await prisma.auth.findUnique({
      where: {
        authentication_id: authId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let attachmentContent = "request.pdf";
    let subject = "Request Form Submission for Fleet Management";
    let body = `Dear Fleet Administrator,
    
    I trust this message finds you well. This mail is to submit a request form that requires your attention. Attached to this email is a PDF document containing the necessary details for your review and completion.
      
    Please take a moment to review the attached PDF and fill in the required information. Once completed, kindly save the document and return it to me at your earliest convenience.
      
    Thank you for your cooperation.
      
    Best regards,
    MotorPool`;
    await sendEmail(user.emailId, subject, body, attachmentContent);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendRequestFormMail, sendRequestForm, sendHandoverForm };
