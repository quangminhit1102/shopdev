"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  static async login(req, res, next) {
    new OK({
      message: "Login successfully",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  static async register(req, res, next) {
    new CREATED({
      message: "Register successfully",
      metadata: await AccessService.register(req.body),
    }).send(res);
  }

  static async logout(req, res, next) {
    new OK({
      message: "Logout successfully",
      metadata: await AccessService.logout(req),
    }).send(res);
  }

  static async refresh(req, res, next) {
    new OK({
      message: "refresh token successfully",
      metadata: await AccessService.refresh(req.body),
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
