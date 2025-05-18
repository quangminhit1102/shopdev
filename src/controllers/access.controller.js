// AccessController handles authentication and authorization HTTP requests.
// Each static method corresponds to a specific access operation and delegates to AccessService.

"use strict";

const { CREATED, OK } = require("../core/success.response");
const AccessService = require("../services/access.service");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 */

/**
 * Handles user authentication and authorization endpoints.
 * Each method delegates to the corresponding service for business logic.
 */
class AccessController {
  /**
   * @swagger
   * /shopdev/login:
   *   post:
   *     summary: Login a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Server error
   */
  static async login(req, res, next) {
    new OK({
      message: "Login successfully",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/register:
   *   post:
   *     summary: Register a new user/shop
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  static async register(req, res, next) {
    new CREATED({
      message: "Register successfully",
      metadata: await AccessService.register(req.body),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/logout:
   *   post:
   *     summary: Logout the current user
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async logout(req, res, next) {
    new OK({
      message: "Logout successfully",
      metadata: await AccessService.logout(req),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/refresh-token:
   *   post:
   *     summary: Refresh authentication token
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev:
   *   get:
   *     summary: Get user access information
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Access information retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getAccess(req, res, next) {
    new OK({
      message: "Access granted",
      metadata: await AccessService.getAccess(),
    }).send(res);
  }
}

module.exports = AccessController;
