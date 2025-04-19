"use strict";

const { Types } = require("mongoose");
const {
  Product,
  Electronics,
  Clothing,
  Furniture,
} = require("../product.model");

// Query product with pagination
const queryProduct = async ({ query, limit, skip }) => {
  return await Product.find(query)
    .limit(limit)
    .skip(skip)
    .populate("product_shop", "name email -_id")
    .lean();
};

// Find all products of a shop with pagination
const findAllDraftProductsOfShop = async ({ query, limit, skip }) => {
  return await queryProduct({
    query: { ...query, isDraft: true },
    limit,
    skip,
  });
};

// Find all published products of a shop with pagination
const findAllPublishedProductsOfShop = async ({ query, limit, skip }) => {
  return await queryProduct({
    query: { ...query, isPublished: true },
    limit,
    skip,
  });
};

const publishProduct = async ({ product_shop, product_id }) => {
  const foundShop = await Product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })
    .lean()
    .exec();
  if (!foundShop) return null;

  foundShop.isPublished = true;
  foundShop.isDraft = false;

  const { modifiedCount } = await Product.updateOne(
    { _id: foundShop._id },
    { $set: { isPublished: true, isDraft: false } }
  );

  return modifiedCount > 0 ? foundShop : null;
};

const unPublishProduct = async ({ product_shop, product_id }) => {
  const foundShop = await Product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  })
    .lean()
    .exec();
  if (!foundShop) return null;

  foundShop.isPublished = false;
  foundShop.isDraft = true;

  const { modifiedCount } = await Product.updateOne(
    { _id: foundShop._id },
    { $set: { isPublished: false, isDraft: true } }
  );

  return modifiedCount > 0 ? foundShop : null;
};

const searchProducts = async ({ keySearch, limit, skip }) => {
  const regexSearch = new RegExp(keySearch);
  const result = await Product.find(
    {
      isPublished: true,
      $text: { $search: regexSearch }, // Use $text for full-text search
    },
    { score: { $meta: "textScore" } } // Include score in the projection
  )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return result.length > 0 ? result : null;
};

// Export functions
module.exports = {
  findAllDraftProductsOfShop,
  findAllPublishedProductsOfShop,
  publishProduct,
  unPublishProduct,
  searchProducts,
};
