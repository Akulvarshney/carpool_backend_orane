const nodemailer = require("nodemailer");

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carpool.orane@gmail.com",
    pass: "Carpool@123",
  },
});

module.exports = transporter;
