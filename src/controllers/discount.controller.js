"use strict";

/**
 * @swagger
 * tags:
 *   name: Discounts
 *   description: Discount management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Discount:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - type
 *         - value
 *         - code
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [fixed_amount, percentage]
 *         value:
 *           type: number
 *         code:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         maxUses:
 *           type: number
 *         usageCount:
 *           type: number
 *         shopId:
 *           type: string
 */

const DiscountService = require("../services/discount.service");
const { CREATED, OK } = require("../core/success.response");

/**
 * Handles all discount-related HTTP requests.
 * Each method delegates to DiscountService for business logic.
 */
class DiscountController {
  /**
   * @swagger
   * /shopdev/discount:
   *   post:
   *     summary: Create a new discount
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Discount'
   *     responses:
   *       201:
   *         description: Discount created successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async createDiscount(req, res) {
    new CREATED({
      message: "Discount code created successfully",
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/discount/{code}/products:
   *   get:
   *     summary: Get all products eligible for a discount code
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of eligible products
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Discount code not found
   *       500:
   *         description: Server error
   */
  static async getAllProductsByDiscountCode(req, res) {
    new OK({
      message: "Get all products by discount code successfully",
      metadata: await DiscountService.getAllProductsByDiscountCode({
        ...req.body,
        shop_id: req.user._id,
        code: req.params.code,
      }),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/discount:
   *   get:
   *     summary: Get all discounts for a shop
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of discounts
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getAllDiscountsByShop(req, res) {
    new OK({
      message: "Get all discounts successfully",
      metadata: await DiscountService.GetAllDiscountsByShop({
        shop_id: req.user._id,
        ...req.query,
      }),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/discount/amount:
   *   post:
   *     summary: Calculate discount amount
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - userId
   *               - products
   *             properties:
   *               code:
   *                 type: string
   *               userId:
   *                 type: string
   *               products:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Discount amount calculated
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Discount code not found
   *       500:
   *         description: Server error
   */
  static async getDiscountAmount(req, res) {
    new OK({
      message: "Get discount amount successfully",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/discount/{code}:
   *   delete:
   *     summary: Delete a discount code
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Discount code deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Discount code not found
   *       500:
   *         description: Server error
   */
  static async deleteDiscountCode(req, res) {
    new OK({
      message: "Delete discount code successfully",
      metadata: await DiscountService.deleteDiscountCode({
        shop_id: req.user._id,
        code: req.params.code,
      }),
    }).send(res);
  }

  /**
   * @swagger
   * /shopdev/discount/cancel:
   *   post:
   *     summary: Cancel a discount code
   *     tags: [Discounts]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - codeId
   *               - shopId
   *             properties:
   *               codeId:
   *                 type: string
   *               shopId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Discount code cancelled successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Discount code not found
   *       500:
   *         description: Server error
   */
  static async cancelDiscountCode(req, res) {
    new OK({
      message: "Cancel discount code successfully",
      metadata: await DiscountService.cancelDiscountCode({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  }
}

module.exports = DiscountController;
