"use strict";
const { format } = require("morgan");
const winston = require("winston");
require("winston-daily-rotate-file");
const { v4: uuidv4 } = require("uuid");

class MyLogger {
  constructor() {
    // Format for the log messages
    const formatPrint = winston.format.printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        return `${timestamp}::${level}::${context}::${requestId}::${message}::${JSON.stringify(
          metadata
        )}`;
      }
    );

    // Create a logger instance with the specified format
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        formatPrint
      ),
      // Define the transports for the logger
      // In this case, we are using the Console transport for logging to the console
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "application-%DATE%.info.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            formatPrint
          ),
          level: "info",
        }),
        new winston.transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "application-%DATE%.error.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            formatPrint
          ),
          level: "error",
        }),
      ],
    });
  }

  commonParams(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = JSON.stringify(params);
    } else {
      [context, req, metadata] = params;
    }

    const requestId = req?.requestId || uuidv4().toString();
    return {
      requestId,
      context,
      metadata,
    };
  }

  log(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = { message, ...paramsLog };
    this.logger.info(logObject);
  }
  error(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = { message, ...paramsLog };
    this.logger.error(logObject);
  }
}

module.exports = new MyLogger();
