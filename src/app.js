require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

// Security HTTP headers
app.use(helmet());
// Enable CORS for all origins
app.use(cors());
// HTTP request logging
app.use(morgan("combined"));
// Parse application/json
app.use(express.json());
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Response compression
app.use(compression());

// Initialize database
require("./dbs/init.mongodb");

// Initialize routes
app.use("/", require("./routers"));

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Centralized error handler (should be the last middleware)
app.use(errorHandler);

// Export app
module.exports = app;
