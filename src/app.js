require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const { checkOverload } = require("./helpers/check.connect");

// Init database
require("./dbs/init.mongodb");
// checkOverload();

// Init middleware

// Logging
//app.use(morgan("dev"));
app.use(morgan("combined"));
// app.use(morgan("short"));
// app.use(morgan("tiny"));

// Helmet
app.use(helmet());

// Compression
/* Reduced Data Transfer Size: Compression significantly reduces the size of data sent over the network, typically achieving 60-80% reduction for text-based content.*/
app.use(compression);


// Init database

// Init routes
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello world",
  });
});

// Handling errors

module.exports = app;
