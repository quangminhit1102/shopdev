"use strict";
const shopModel = require("../models/shop.model");

class AccessService {
  static async getAccess() {
    let a = shopModel.findOne();
    console.log(a);
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
