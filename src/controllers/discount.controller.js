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
        shop_id: req.user._id,
      }),
    }).send(res);
  }

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
   * Get all discounts for a shop.
   * @route GET /v1/api/discount/shop
   * @param {Request} req
   * @param {Response} res
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
   * Delete a discount code (Shop/Admin).
   * @route DELETE /v1/api/discount/:code
   * @param {Request} req
   * @param {Response} res
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
        shop_id: req.user._id,
      }),
    }).send(res);
  }
}

module.exports = DiscountController;
