require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swagger");
const errorHandler = require("./middlewares/errorHandler");
const { v4: uuidv4 } = require("uuid");
const myLogger = require("./loggers/mylogger.log");

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

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware to generate and set a unique request ID
// This can be useful for tracing requests in logs
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", requestId);
  req.requestId = requestId; // Attach request ID to the request object

  myLogger.log(
    `Input params::${req.method} ${req.originalUrl} - Request ID: ${requestId}`,
    [
      req.path, // Path of the request
      {
        requestId: requestId, // Unique request ID
      },
      req.method === "POST" ? req.body : req.query, // Body for POST requests, query for GET requests
    ]
  );

  next();
});

// Initialize database
require("./dbs/init.mongodb");

// // Initialize Elasticsearch client
// require("./dbs/elastic-client");

// // Initialize Redis client
// require("./dbs/init.redis").initRedis();

// Initialize ioredis client
require("./dbs/init.ioredis").initRedis({
  IOREDIS_IS_ENABLED: process.env.IOREDIS_IS_ENABLED || true,
  IOREDIS_HOST: process.env.IOREDIS_HOST || "localhost",
  IOREDIS_PORT: process.env.IOREDIS_PORT || 6379,
});

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
