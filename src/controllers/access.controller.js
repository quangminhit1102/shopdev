"use strict";

const AccessService = require("../services/access.service");

class AccessController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AccessService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AccessService.register({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
}

module.exports = AccessController;
