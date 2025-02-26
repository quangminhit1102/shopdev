"use strict";

class AccessController {
  static async getAccess(req, res, next) {
    res.send("Hello world");
  }

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
      next(error);
    }
  }
}

module.exports = AccessController;
