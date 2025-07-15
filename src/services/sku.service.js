"use strict";
const skuModel = require("../models/sku.model");
const { NotFoundError } = require("../core/error.response");
const { getRedisClient, initRedis } = require("../dbs/init.redis");

const GetSKU = async ({ sku_id, product_id }) => {
  // // Ensure Redis is initialized
  // let redisClient = getRedisClient();
  // if (!redisClient) {
  //   redisClient = await initRedis();
  // }
  // const cacheKey = `sku:${sku_id}:product:${product_id}`;
  // // Try to get from cache
  // let cached = await redisClient.get(cacheKey);
  // if (cached) {
  //   console.log(`GET SKU from cache REDIS::${cached}`);
  //   return JSON.parse(cached);
  // }

  // Find sku in DB (use correct field names)
  const sku = await skuModel.findOne({
    sku_id,
    product_id,
  });
  if (!sku) {
    throw new NotFoundError("SKU not found");
  }

  // // Cache the result for 5 minutes (300 seconds)
  // await redisClient.setEx(cacheKey, 300, JSON.stringify(sku));

  return sku;
};

const GetSKUsByProductId = async ({ product_id }) => {
  // Find all SKUs for the product
  const skus = await skuModel
    .find({
      product_id,
      isDeleted: false,
    })
    .sort({ sku_sort: -1 }); // Sort by sku_sort in descending order

  if (!skus.length) {
    throw new NotFoundError("No SKUs found for this product");
  }

  return skus;
};

module.exports = { GetSKU, GetSKUsByProductId };
