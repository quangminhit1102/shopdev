"use strict";

class AccessController {
  static async getAccess(req, res, next) {
    res.send("Hello world");
  }

  static async login(req, res, next) {
    res.send("Login");
  }

  static async register(req, res, next) {
    res.send("Register");
  }
}

module.exports = AccessController;
