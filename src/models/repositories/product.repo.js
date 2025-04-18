"use strict";

const { Types } = require("mongoose");
const {
  Product,
  Electronics,
  Clothing,
  Furniture,
} = require("../product.model");
const { search } = require("../../routers");

// Query product with pagination
const queryProduct = async ({ query, limit, skip }) => {
  return await productModel
    .find(query)
    .limit(limit)
    .skip(skip)
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();
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

const publicProduct = async ({ product_shop, product_id }) => {
  const foundShop = await Product.findOne({
    product_shop: Types.ObjectId.createFromString(product_shop),
    _id: Types.ObjectId.createFromString(product_id),
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

const unPublicProduct = async ({ product_shop, product_id }) => {
  const foundShop = await Product.findOne({
    product_shop: Types.ObjectId.createFromString(product_shop),
    _id: Types.ObjectId.createFromString(product_id),
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
  publicProduct,
  unPublicProduct,
  searchProduct,
};
