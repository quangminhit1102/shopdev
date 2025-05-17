"use strict";

const productModel = require("../models/product.model");

class InventoryService {
  static async addStockToInventory({
    product_id,
    shop_id,
    stock,
    location = "Unknown",
  }) {
    const foundProduct = productModel.findOne({
      _id: product_id,
      product_shopId: shop_id,
    });
    if (!foundProduct) {
      throw new Error("Product not found");
    }

    const query = {
        inventory_product: product_id,
        inventory_shopId: shop_id,
      },
      updateSet = {
        $inc: { inventory_stock: stock },
      },
      options = {
        new: true,
        upsert: true,
      };
    return await productModel.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
