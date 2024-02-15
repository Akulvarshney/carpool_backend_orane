const jwt = require("jsonwebtoken");

const users = [
  {
    username: "sap",
    password: "admin",
  },
];

function authenticateToken(req, res, next) {
  const token = req.header("Token");

  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, process.env.SECRE_KEY, (err, user) => {
    if (err) return res.status(403).send("Invalid token");

    req.user = user;
    next();
  });
}

const basicAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const credentials = Buffer.from(
      authHeader.split(" ")[1],
      "base64"
    ).toString("utf-8");
    const [username, password] = credentials.split(":");

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Valid credentials, proceed to the next middleware or route handler
      req.user = user;
      next();
    } else {
      // Invalid credentials
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    // No Authorization header provided
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { authenticateToken, basicAuthMiddleware };
