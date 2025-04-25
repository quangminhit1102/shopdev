// AccessController handles authentication and authorization HTTP requests.
// Each static method corresponds to a specific access operation and delegates to AccessService.

"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  /**
   * Login a user with email and password.
   * Delegates authentication to AccessService.login.
   */
  static async login(req, res, next) {
    new OK({
      message: "Login successfully",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  /**
   * Register a new user/shop.
   * Delegates registration to AccessService.register.
   */
  static async register(req, res, next) {
    new CREATED({
      message: "Register successfully",
      metadata: await AccessService.register(req.body),
    }).send(res);
  }

  /**
   * Logout the current user by removing their key/token.
   * Delegates to AccessService.logout.
   */
  static async logout(req, res, next) {
    new OK({
      message: "Logout successfully",
      metadata: await AccessService.logout(req),
    }).send(res);
  }

  /**
   * Refresh the authentication token using a refresh token.
   * Delegates to AccessService.refreshV2.
   */
  static async refresh(req, res, next) {
    new OK({
      message: "Refresh token successfully",
      metadata: await AccessService.refreshV2({
        keyStore: req.keyStore,
        refreshToken: req.headers["x-refresh-token"],
        user: req.user,
      }),
    }).send(res);
  }

  /**
   * Test endpoint to check access (for debugging or health check).
   */
  static async getAccess(req, res, next) {
    new OK({
      message: "Access granted",
      metadata: await AccessService.getAccess(),
    }).send(res);
  }
}

module.exports = AccessController;
