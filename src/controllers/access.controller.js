"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  static async login(req, res, next) {  
    new OK({
      message: "Login successful",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  static async register(req, res, next) {
    new CREATED({
      message: "Register successful",
      metadata: await AccessService.register(req.body),
    }).send(res);
  }
}

module.exports = AccessController;
