"use strict";

const DiscountService = require("../services/discount.service");
const { CREATED, OK } = require("../core/success.response");

/**
 * Handles all discount-related HTTP requests.
 * Each method delegates to DiscountService for business logic.
 */
class DiscountController {
  /**
   * Create new discount code.
   * @route POST /v1/api/discount
   * @param {Request} req
   * @param {Response} res
   */
  static async createDiscount(req, res) {
    new CREATED({
      message: "Discount code created successfully",
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shop_id: req.user.id,
      }),
    }).send(res);
  }

  /**
   * Get discount amount for a user/order.
   * @route POST /v1/api/discount/amount
   * @param {Request} req
   * @param {Response} res
   */
  static async getDiscountAmount(req, res) {
    new OK({
      message: "Get discount amount successfully",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        userId: req.user.id,
      }),
    }).send(res);
  }

  /**
   * Get all discounts for a shop.
   * @route GET /v1/api/discount/shop
   * @param {Request} req
   * @param {Response} res
   */
  static async getAllDiscountsByShop(req, res) {
    new OK({
      message: "Get all discounts successfully",
      metadata: await DiscountService.getAllDiscountsByShop({
        shopId: req.user.id,
        ...req.query,
      }),
    }).send(res);
  }

  /**
   * Verify a discount code for a user.
   * @route POST /v1/api/discount/verify
   * @param {Request} req
   * @param {Response} res
   */
  static async verifyDiscountCode(req, res) {
    new OK({
      message: "Verify discount code successfully",
      metadata: await DiscountService.verifyDiscountCode({
        ...req.body,
        userId: req.user.id,
      }),
    }).send(res);
  }

  /**
   * Delete a discount code (Shop/Admin).
   * @route DELETE /v1/api/discount/:code
   * @param {Request} req
   * @param {Response} res
   */
  static async deleteDiscountCode(req, res) {
    new OK({
      message: "Delete discount code successfully",
      metadata: await DiscountService.deleteDiscountCode({
        shopId: req.user.id,
        code: req.params.code,
      }),
    }).send(res);
  }

  /**
   * Cancel use of a discount code (User).
   * @route POST /v1/api/discount/cancel
   * @param {Request} req
   * @param {Response} res
   */
  static async cancelDiscountCode(req, res) {
    new OK({
      message: "Cancel discount code successfully",
      metadata: await DiscountService.cancelDiscountCode({
        ...req.body,
        userId: req.user.id,
      }),
    }).send(res);
  }
}

module.exports = DiscountController;
