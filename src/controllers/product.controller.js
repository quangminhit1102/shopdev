"use strict";

const { model } = require("mongoose");
const {
  ProductFactory,
  ProductStrategy,
} = require("../services/product.service");
const { CREATED, OK } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res) => {
    new CREATED({
      message: "Product created successfully!",
      metadata: await ProductStrategy.createProduct({
        ...req.body,
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  publishProduct = async (req, res) => {
    new OK({
      message: "Product published successfully!",
      metadata: await ProductStrategy.publishProduct({
        product_shop: req.user?._id,
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  unPublishProduct = async (req, res) => {
    new OK({
      message: "Product unpublished successfully!",
      metadata: await ProductStrategy.unPublishProduct({
        product_shop: req.user?._id,
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  findAllDraftProductsOfShop = async (req, res) => {
    new OK({
      message: "Draft products retrieved successfully!",
      metadata: await ProductStrategy.findAllDraftProductsOfShop({
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  findAllPublishedProductsOfShop = async (req, res) => {
    new OK({
      message: "Published products retrieved successfully!",
      metadata: await ProductStrategy.findAllPublishedProductsOfShop({
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  searchProducts = async (req, res) => {
    new OK({
      message: "Products retrieved successfully!",
      metadata: await ProductStrategy.searchProducts({
        keySearch: req.query.keySearch,
        limit: req.query.limit,
        skip: req.query.skip,
      }),
    }).send(res);
  };

  // get all products of a shop with pagination
  findAllProducts = async (req, res) => {
    new OK({
      message: "Products retrieved successfully!",
      metadata: await ProductStrategy.findAllProducts({
        limit: req.query.limit || 50,
        sort: req.query.sort || "ctime",
        page: req.query.page || 1,
      }),
    }).send(res);
  };

  findProductById = async (req, res) => {
    new OK({
      message: "Product retrieved successfully!",
      metadata: await ProductStrategy.findProductById({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res) => {
    new OK({
      message: "Product updated successfully!",
      metadata: await ProductStrategy.updateProductById({
        product_id: req.params.product_id,
        product_data: req.body,
        product_shop: req.user?._id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
