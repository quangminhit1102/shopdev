"use strict";

/**
 * @description This module defines a base class for success responses in an API.
 * It includes specific classes for different HTTP status codes.
 * @module success.response
 */
const statusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
};

/**
 * @description This class represents a generic success response.
 * @class SuccessResponse
 * @param {Object} options - The options for the success response.
 * @param {string} options.message - The success message.
 * @param {number} [options.statusCode=statusCode.OK] - The HTTP status code.
 * @param {Object} [options.metadata={}] - Additional metadata for the response.
 */
class SuccessResponse {
  constructor({ message, statusCode = statusCode.OK, metadata = {} }) {
    this.message = message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

/**
 * @description This class represents a success response with a 200 OK status.
 * @class OK
 * @extends SuccessResponse
 * @param {Object} options - The options for the success response.
 * @param {string} options.message - The success message.
 * @param {Object} [options.metadata={}] - Additional metadata for the response.
 */
class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, statusCode: statusCode.OK, metadata });
  }
}

/**
 * @description This class represents a success response with a 201 Created status.
 * @class CREATED
 * @extends SuccessResponse
 * @param {Object} options - The options for the success response.
 * @param {string} options.message - The success message.
 * @param {Object} [options.metadata={}] - Additional metadata for the response.
 */
class CREATED extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, statusCode: statusCode.CREATED, metadata });
  }
}

module.exports = { OK, CREATED, SuccessResponse };
