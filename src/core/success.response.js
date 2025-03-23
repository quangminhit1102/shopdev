"use strict";

class SuccessResponse {
  constructor({
    message,
    statusCode = 200,
    reasonStatusCode = "OK",
    metadata = {},
  }) {
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
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, statusCode: 201, reasonStatusCode: "Created", metadata });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
