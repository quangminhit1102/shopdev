"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const DiscountModel = require("../models/discount.model");
const { convertToObjectId } = require("../utils");

/* 
    Discount service
    1 - Generate discount code [ Shop | Admin]
    2 - Get discount amount [ User ]
    3 - Get all discount codes [ User | Shop ]
    4 - Verify discount code [ User ]
    5 - Delete discount code [ Shop | Admin ]
    6 - Cancel discount code [ User ]
*/

class DiscountService {
  /**
   * Generate a new discount code
   * @param {Object} discountData - Discount information
   * @returns {Promise<Object>} Created discount
   */
  static async createDiscount({
    name,
    description,
    type,
    value,
    code,
    start_date,
    end_date,
    max_uses,
    max_uses_per_user,
    min_order_value,
    shop_id,
    is_active,
    applies_to,
    product_ids,
  }) {
    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    // Check if discount code already exists
    const foundDiscount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shop_id),
    });

    if (foundDiscount) {
      throw new BadRequestError("Discount code already exists");
    }

    // Create new discount
    const newDiscount = await DiscountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_max_uses_per_user: max_uses_per_user,
      discount_minimum_order_value: min_order_value,
      discount_shopId: convertToObjectId(shop_id),
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: product_ids,
    });

    return newDiscount;
  }

  /**
   * Calculate discount amount for an order
   * @param {Object} payload
   * @returns {Promise<Object>} Discount amount and info
   */
  static async getDiscountAmount({
    code,
    userId,
    shopId,
    products,
    orderValue,
  }) {
    const foundDiscount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    // Validate discount
    await this.validateDiscount({
      discount: foundDiscount,
      userId,
      orderValue,
    });

    // Calculate discount amount
    const amount =
      foundDiscount.discount_type === "fixed"
        ? foundDiscount.discount_value
        : (orderValue * foundDiscount.discount_value) / 100;

    return {
      discount: foundDiscount,
      totalOrder: orderValue,
      discount_amount: amount,
      final_price: orderValue - amount,
    };
  }

  /**
   * Get all discount codes
   * @param {Object} query
   * @returns {Promise<Array>} List of discounts
   */
  static async getAllDiscountsByShop({
    shopId,
    limit = 50,
    page = 1,
    isActive,
  }) {
    const query = {
      discount_shopId: convertToObjectId(shopId),
    };

    if (typeof isActive !== "undefined") {
      query.discount_is_active = isActive;
    }

    return await DiscountModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  /**
   * Verify a discount code
   * @param {Object} payload
   * @returns {Promise<Object>} Verified discount
   */
  static async verifyDiscountCode({ code, shopId, userId }) {
    const foundDiscount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    // Validate basic discount rules
    await this.validateDiscount({
      discount: foundDiscount,
      userId,
    });

    return foundDiscount;
  }

  /**
   * Delete a discount code
   * @param {Object} payload
   * @returns {Promise<Object>} Deleted discount
   */
  static async deleteDiscountCode({ shopId, code }) {
    const deleted = await DiscountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!deleted) {
      throw new NotFoundError("Discount not found");
    }

    return deleted;
  }

  /**
   * Cancel use of a discount code
   * @param {Object} payload
   * @returns {Promise<Object>} Updated discount
   */
  static async cancelDiscountCode({ code, shopId, userId }) {
    const foundDiscount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    const result = await DiscountModel.findByIdAndUpdate(
      foundDiscount._id,
      {
        $pull: { discount_users_used: userId },
        $inc: { discount_uses_count: -1 },
      },
      { new: true }
    );

    return result;
  }

  /**
   * Validate a discount
   * @private
   */
  static async validateDiscount({ discount, userId, orderValue = 0 }) {
    if (!discount.discount_is_active) {
      throw new BadRequestError("Discount is inactive");
    }

    if (
      discount.discount_max_uses > 0 &&
      discount.discount_uses_count >= discount.discount_max_uses
    ) {
      throw new BadRequestError("Discount has reached maximum usage");
    }

    if (
      new Date() < new Date(discount.discount_start_date) ||
      new Date() > new Date(discount.discount_end_date)
    ) {
      throw new BadRequestError("Discount has expired or not started yet");
    }

    if (orderValue > 0 && orderValue < discount.discount_minimum_order_value) {
      throw new BadRequestError(
        `Minimum order value is ${discount.discount_minimum_order_value}`
      );
    }

    if (userId) {
      const userUsageCount = discount.discount_users_used.filter(
        (id) => id.toString() === userId.toString()
      ).length;

      if (userUsageCount >= discount.discount_max_uses_per_user) {
        throw new BadRequestError(
          "You have reached maximum usage for this discount"
        );
      }
    }
  }

  static async updateDiscount(discountId, discountData) {
    try {
      // Validate discount ID and data
      if (!discountId || !discountData) {
        throw new BadRequestError("Invalid discount ID or data");
      }

      // Update discount in the database
      const updatedDiscount = await DiscountModel.findByIdAndUpdate(
        discountId,
        discountData,
        { new: true }
      );
      if (!updatedDiscount) {
        throw new NotFoundError("Discount not found");
      }
      return updatedDiscount;
    } catch (error) {
      throw new InternalServerError("Failed to update discount", error);
    }
  }
}

module.exports = DiscountService;
