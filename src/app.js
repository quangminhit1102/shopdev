require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

// parse application/json
app.use(express.json());
// parse application/x-www-form-urlencoded
// Extended allows for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.urlencoded({ extended: true }));

// Init database
require("./dbs/init.mongodb");

// checkOverload();

// Init middleware

// Logging
// app.use(morgan("dev"));
app.use(morgan("combined"));
// app.use(morgan("short"));
// app.use(morgan("tiny"));
// Morgan for HTTP request logging

// Helmet
app.use(helmet());

// Compression
/* Reduced Data Transfer Size: Compression significantly reduces the size of data sent over the network, typically achieving 60-80% reduction for text-based content.*/
app.use(compression());

// Init database

// Init routes
app.use("/", require("./routers"));

// Handling errors
// 404 Not Found
app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.status(404).json({ message: error.message });
  next(); // pass the error to the next error middleware
});

// 500 Internal Server Error
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message: message });
});

// export app
module.exports = app;
