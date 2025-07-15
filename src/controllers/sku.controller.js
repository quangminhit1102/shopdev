"use strict";
const { GetSKU, GetSKUsByProductId } = require("../services/sku.service");
const { OK } = require("../core/success.response");

class SKUController {
  /**
   * Get a single SKU by product_id and sku_id
   * @route GET /shopdev/product/sku?product_id=xxx&sku_id=yyy
   */
  getSKU = async (req, res, next) => {
    try {
      const { product_id, sku_id } = req.query;
      const sku = await GetSKU({ product_id, sku_id });
      new OK({
        message: "SKU retrieved successfully!",
        metadata: sku,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all SKUs for a product
   * @route GET /shopdev/product/skus?product_id=xxx
   */
  getSKUsByProductId = async (req, res, next) => {
    try {
      const { product_id } = req.query;
      if (!product_id) {
        throw new Error("Missing required parameter: product_id");
      }
      const skus = await GetSKUsByProductId({ product_id });
      new OK({
        message: "SKUs retrieved successfully!",
        metadata: skus,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new SKUController();
