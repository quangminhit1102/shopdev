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

  static async logout(req, res, next) {
    new OK({
      message: "Logout successful",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  }

  static async getAccess(req, res, next) {
    new OK({
      message: "Access granted",
      metadata: await AccessService.getAccess(),
    }).send(res);
  }
}

module.exports = AccessController;
