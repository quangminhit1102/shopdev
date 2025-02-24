"use strict";
const shopModel = require("../../models/shop.model");

class AccessService {
  static async getAccess() {
    return "Hello world";
  }

  static async login() {
    return "Login";
  }

  static async register() {
    return "Register";
  }
}

module.exports = AccessService;
