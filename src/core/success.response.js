"use strict";

const statusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
};

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

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, statusCode: statusCode.OK, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, statusCode: statusCode.CREATED, metadata });
  }
}

module.exports = { OK, CREATED, SuccessResponse };
