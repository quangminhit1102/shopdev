"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const DiscountModel = require("../models/discount.model");
const ProductRepository = require("../models/repositories/product.repo");
const DiscountRepository = require("../models/repositories/discount.repo");
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

    // If found and active, throw an error
    if (foundDiscount && foundDiscount.discount_is_active) {
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
  static async getAllProductsByDiscountCode({ code, shop_id, limit, page }) {
    // Find discount code
    const discount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shop_id),
    });
    if (!discount || !discount.discount_is_active) {
      throw new NotFoundError("Discount code not found");
    }

    // Check if discount is applicable to specific products or all products
    // 1/ If discount applies to specific products, filter by product IDs
    if (discount.discount_applies_to === "specific") {
      const productIds = discount.discount_product_ids.map((id) =>
        id.toString()
      );
      const products = await ProductRepository.findAllProducts({
        shop_id: convertToObjectId(shop_id),
        limit,
        page,
        filter: {
          product_shop: convertToObjectId(shop_id),
          _id: { $in: productIds },
        },
      });
      return products;
    }

    // 2/ If discount applies to all products, return all products
    if (discount.discount_applies_to === "all") {
      const products = await ProductRepository.findAllProducts({
        shop_id: convertToObjectId(shop_id),
        limit,
        page,
      });
      return products;
    }
  }

  static async GetAllDiscountsByShop({ shop_id, limit, page }) {
    return await DiscountRepository.findAllDiscountCodesUnselect({
      limit,
      page,
      filter: {
        discount_shopId: convertToObjectId(shop_id),
      },
      model: DiscountModel,
      unselect: ["__v", "createdAt", "updatedAt", "_id"],
    });
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
