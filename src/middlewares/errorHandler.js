const errorHandler = (err, req, res, next) => {
  // If the error is a custom error (instanceof ErrorResponse or AppError)
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    message,
    // Optionally include stack trace in development
    // ...(process.env.NODE_ENV === "Development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
