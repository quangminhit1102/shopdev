"use strict";

/**
 * @description This module defines custom error classes for different HTTP status codes and their corresponding messages.
 * @module error.response
 * @requires Error
 * @exports ConflictRequestError
 * @exports BadRequestError
 * @exports AuthFailureError
 * @exports NotFoundError
 * @exports ForbiddenError
 * @exports InternalServerError
 */
const StatusCode = {
  FORBIDDEN: 403,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL_SERVER: 500,
};

/**
 * @description This object contains the default error messages for different HTTP status codes.
 * @constant
 * @type {Object}
 * @property {string} FORBIDDEN - The default message for Forbidden errors.
 * @property {string} CONFLICT - The default message for Conflict errors.
 * @property {string} UNAUTHORIZED - The default message for Unauthorized errors.
 * @property {string} NOT_FOUND - The default message for Not Found errors.
 * @property {string} BAD_REQUEST - The default message for Bad Request errors.
 * @property {string} INTERNAL_SERVER - The default message for Internal Server errors.
 */
const ReasonStatusCode = {
  FORBIDDEN: "Bad request error",
  CONFLICT: "Conflict error",
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Not found",
  BAD_REQUEST: "Bad request",
  INTERNAL_SERVER: "Internal Server Error",
};

/**
 * @class ErrorResponse
 * @extends Error
 * @description Base class for all error responses.
 * @param {string} message - The error message.
 * @param {number} status - The HTTP status code.
 */
class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * @class ConflictRequestError
 * @extends ErrorResponse
 * @description Class for handling conflict request errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class ConflictRequestError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.CONFLICT,
    statusCode = StatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}

/**
 * @class BadRequestError
 * @extends ErrorResponse
 * @description Class for handling bad request errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.BAD_REQUEST,
    statusCode = StatusCode.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}
/**
 * @class AuthFailureError
 * @extends ErrorResponse
 * @description Class for handling authentication failure errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.UNAUTHORIZED,
    statusCode = StatusCode.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

/**
 * @class NotFoundError
 * @extends ErrorResponse
 * @description Class for handling not found errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.NOT_FOUND,
    statusCode = StatusCode.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

/**
 * @class ForbiddenError
 * @extends ErrorResponse
 * @description Class for handling forbidden errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.FORBIDDEN,
    statusCode = StatusCode.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

/**
 * @class InternalServerError
 * @extends ErrorResponse
 * @description Class for handling internal server errors.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class InternalServerError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.INTERNAL_SERVER,
    statusCode = StatusCode.INTERNAL_SERVER
  ) {
    super(message, statusCode);
  }
}

/**
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    //Error.captureStackTrace(this, this.constructor); // Capture the stack trace to exclude the constructor call from the stack trace
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
  InternalServerError,
  AppError,
};
