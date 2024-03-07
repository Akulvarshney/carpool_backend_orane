const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const dotenv = require("dotenv");
const routes = require("./routes/routes");

dotenv.config();

const app = express();
const domain = process.env.DOMAIN;
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", routes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const options = {
  key: fs.readFileSync("ssl/generated-private-key.txt"),
  ca: fs.readFileSync("ssl/gd_bundle-g2-g1.crt"),
  cert: fs.readFileSync("ssl/6ee31360b7be374a.crt"),
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(port, () => {
  console.log(`Server running on https://${domain}:${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
