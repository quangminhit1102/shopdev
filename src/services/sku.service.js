"use strict";
const skuModel = require("../models/sku.model");
const { NotFoundError } = require("../core/error.response");
// const { getRedisClient, initRedis } = require("../dbs/init.redis");
const { getRedisClient } = require("../dbs/init.ioredis");
const {
  setCacheIOExpiration,
  getCacheIO,
} = require("../models/repositories/cache.redis.repo");

const CACHE_PRODUCT_SKU = "product:sku";

const GetSKU = async ({ sku_id, product_id }) => {
  // ================= Cache redis ======================
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

  // ================ Cache penetration ================
  // 1. Check input parameters
  if (!sku_id || !product_id) {
    return null; // or throw an error if you prefer
  }

  // 2. Check if SKU exists in cache
  const skuKeyCache = `CACHE_PRODUCT_SKU_${sku_id}`;
  const skuCache = await getCacheIO({ key: skuKeyCache });
  if (skuCache) {
    console.log(`GET SKU from cache REDIS::${skuCache}`);
    return {
      ...JSON.parse(skuCache),
      loadFrom: "cache",
    };
  }
  // 3. If not in cache, proceed to DB query
  else {
    // Find sku in DB (use correct field names)
    const sku = await skuModel
      .findOne({
        sku_id,
        product_id,
      })
      .lean();

    const valueCache = sku ? JSON.stringify(sku) : null;

    setCacheIOExpiration(skuKeyCache, valueCache, 30); // Cache for 30 seconds
    return {
      ...JSON.parse(valueCache),
      loadFrom: "database",
    };
  }

  // // Cache the result for 5 minutes (300 seconds)
  // await redisClient.setEx(cacheKey, 300, JSON.stringify(sku));

  // return sku;
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
