"use strict";

const DiscountService = require("../services/discount.service");
const { CREATED, OK } = require("../core/success.response");

class DiscountController {
  /**
   * Create new discount code
   * @route POST /v1/api/discount
   */
  static async createDiscount(req, res) {
    new CREATED({
      message: "Discount code created successfully",
      metadata: await DiscountService.createDiscount({
        ...req.body,
        shop_id: req.user.id
      })
    }).send(res);
  }

  /**
   * Get discount amount
   * @route POST /v1/api/discount/amount
   */
  static async getDiscountAmount(req, res) {
    new OK({
      message: "Get discount amount successfully",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
        userId: req.user.id
      })
    }).send(res);
  }

  /**
   * Get all discounts for a shop
   * @route GET /v1/api/discount/shop
   */
  static async getAllDiscountsByShop(req, res) {
    new OK({
      message: "Get all discounts successfully",
      metadata: await DiscountService.getAllDiscountsByShop({
        shopId: req.user.id,
        ...req.query
      })
    }).send(res);
  }

  /**
   * Verify a discount code
   * @route POST /v1/api/discount/verify
   */
  static async verifyDiscountCode(req, res) {
    new OK({
      message: "Verify discount code successfully",
      metadata: await DiscountService.verifyDiscountCode({
        ...req.body,
        userId: req.user.id
      })
    }).send(res);
  }

  /**
   * Delete a discount code
   * @route DELETE /v1/api/discount/:code
   */
  static async deleteDiscountCode(req, res) {
    new OK({
      message: "Delete discount code successfully",
      metadata: await DiscountService.deleteDiscountCode({
        shopId: req.user.id,
        code: req.params.code
      })
    }).send(res);
  }

  /**
   * Cancel use of a discount code
   * @route POST /v1/api/discount/cancel
   */
  static async cancelDiscountCode(req, res) {
    new OK({
      message: "Cancel discount code successfully",
      metadata: await DiscountService.cancelDiscountCode({
        ...req.body,
        userId: req.user.id
      })
    }).send(res);
  }
}

module.exports = DiscountController;