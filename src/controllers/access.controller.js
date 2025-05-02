// AccessController handles authentication and authorization HTTP requests.
// Each static method corresponds to a specific access operation and delegates to AccessService.

"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

/**
 * Handles user authentication and authorization endpoints.
 * Each method delegates to the corresponding service for business logic.
 */
class AccessController {
  /**
   * Login a user with email and password.
   * @route POST /shopdev/login
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  static async login(req, res, next) {
    new OK({
      message: "Login successfully",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  /**
   * Register a new user/shop.
   * @route POST /shopdev/register
   * @param {Request} req
   * @param {Response} res
   */
  static async register(req, res, next) {
    new CREATED({
      message: "Register successfully",
      metadata: await AccessService.register(req.body),
    }).send(res);
  }

  /**
   * Logout the current user by removing their key/token.
   * @route POST /shopdev/logout
   * @param {Request} req
   * @param {Response} res
   */
  static async logout(req, res, next) {
    new OK({
      message: "Logout successfully",
      metadata: await AccessService.logout(req),
    }).send(res);
  }

  /**
   * Refresh the authentication token using a refresh token.
   * @route POST /shopdev/refresh
   * @param {Request} req
   * @param {Response} res
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
   * @route GET /shopdev/access
   * @param {Request} req
   * @param {Response} res
   */
  static async getAccess(req, res, next) {
    new OK({
      message: "Access granted",
      metadata: await AccessService.getAccess(),
    }).send(res);
  }
}

module.exports = AccessController;
