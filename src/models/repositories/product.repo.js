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

const searchProduct = async ({ product_name, limit, skip }) => {
  const foundProducts = await Product.find({
    product_name: { $regex: product_name, $options: "i" },
  })
    .limit(limit)
    .skip(skip)
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();

  return foundProducts;
};

// Export functions
module.exports = {
  findAllDraftProductsOfShop,
  findAllPublishedProductsOfShop,
  publishProduct,
  unPublishProduct,
  searchProduct,
};
