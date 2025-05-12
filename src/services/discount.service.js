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
      discount_product_ids: applies_to === "specific" ? product_ids : [],
      discount_uses_count: 0,
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

  static async getDiscountAmount({ code, shop_id, user_id, products }) {
    // Check input products
    if (!Array.isArray(products) || products.length === 0) {
      throw new BadRequestError("Products must be an array and not empty");
    }

    // Find discount code
    const discount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shop_id),
    });

    /* Check discount code */
    // Check is active
    if (!discount || !discount.discount_is_active) {
      throw new NotFoundError("Discount code not found");
    }
    // Check start date and end date
    const currentDate = new Date();
    if (
      currentDate < discount.discount_start_date ||
      currentDate > discount.discount_end_date
    ) {
      throw new BadRequestError("Discount code is not valid at this time");
    }

    // Check minimum order value
    const totalOrderValue = products.reduce((total, product) => {
      return total + product.product_price * product.product_quantity;
    }, 0);
    if (totalOrderValue < discount.discount_minimum_order_value) {
      throw new BadRequestError(
        "Minimum order value not met for this discount code"
      );
    }

    // Check max uses
    if (discount.discount_max_uses > 0) {
      if (discount.discount_uses_count >= discount.discount_max_uses) {
        throw new BadRequestError("Discount code has reached its maximum uses");
      }
    }

    // Check user max uses
    if (discount.discount_max_uses_per_user > 0) {
      const userUsedCount = discount.discount_users_used.filter(
        (user) => user.toString() === user_id.toString()
      ).length;
      if (userUsedCount >= discount.discount_max_uses_per_user) {
        throw new BadRequestError(
          "You have reached the maximum uses for this discount code"
        );
      }
    }

    // check if discount code is used for specific products
    if (discount.discount_applies_to === "specific") {
      const productIds = discount.discount_product_ids.map((id) =>
        id.toString()
      );
      const isValidProduct = products.every((product) =>
        productIds.includes(product.product_id.toString())
      );
      if (!isValidProduct) {
        throw new BadRequestError(
          "Discount code is not valid for these products"
        );
      }
    }

    // Calculate discount amount check discount type is percentage or fixed amount
    const amount =
      discount.discount_type === "percentage"
        ? (discount.discount_value / 100) * totalOrderValue
        : discount.discount_value;

    return {
      discountCode: discount.discount_code,
      totalPriceBefore: totalOrderValue,
      discount: amount,
      totalPrice: totalOrderValue - amount,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
    };
  }

  /**
   * Delete a discount code
   * @param {Object} payload
   * @returns {Promise<Object>} Deleted discount
   */
  static async deleteDiscountCode({ shop_id, code }) {
    const deleted = await DiscountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: convertToObjectId(shop_id),
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
  static async cancelDiscountCode({ code, shop_id, user_id }) {
    // Check discount code
    const foundDiscount = await DiscountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shop_id),
    });
    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    const result = await DiscountModel.findByIdAndUpdate(
      foundDiscount._id,
      {
        $pull: { discount_users_used: user_id },
        $inc: { discount_uses_count: -1, discount_max_uses: 1 },
      },
      { new: true }
    );

    return result;
  }
}

module.exports = DiscountService;
