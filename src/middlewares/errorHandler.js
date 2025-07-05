const myLogger = require("../loggers/mylogger.log");

const errorHandler = (err, req, res, next) => {
  // If the error is a custom error (instanceof ErrorResponse or AppError)
  const status = err.statusCode || err.status || 500;

  myLogger.error(
    `Error occurred: Status::${status}-Duration::${
      Date.now() - err.now
    }ms-RequestId:${req.requestId}`,
    [
      req.path, // Path of the request
      {
        requestId: req.requestId, // Unique request ID
      },
      err.message, // Error message
      err.stack, // Stack trace for debugging
    ]
  );

  const message = err.message || "Internal Server Error";
  res.status(status).json({
    message,
    // Optionally include stack trace in development
    // ...(process.env.NODE_ENV === "Development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
