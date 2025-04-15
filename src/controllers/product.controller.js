"use strict";

const { model } = require("mongoose");
const {
  ProductFactory,
  ProductStrategy,
} = require("../services/product.service");
const { CREATED } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res) => {
    new CREATED({
      message: "Product created successfully!",
      metadata: await ProductStrategy.createProduct(req.body),
    }).send(res);
  };

  publishProduct = async (req, res) => {
    new CREATED({
      message: "Product published successfully!",
      metadata: await ProductStrategy.publishProduct(req.body),
    }).send(res);
  };

  unPublishProduct = async (req, res) => {
    new CREATED({
      message: "Product unpublished successfully!",
      metadata: await ProductStrategy.unPublishProduct(req.body),
    }).send(res);
  };

  findAllDraftProductsOfShop = async (req, res) => {
    new CREATED({
      message: "Draft products retrieved successfully!",
      metadata: await ProductStrategy.findAllDraftProductsOfShop(req.body),
    }).send(res);
  };

  findAllPublishedProductsOfShop = async (req, res) => {
    new CREATED({
      message: "Published products retrieved successfully!",
      metadata: await ProductStrategy.findAllPublishedProductsOfShop(req.body),
    }).send(res);
  };

  searchProducts = async (req, res) => {
    new CREATED({
      message: "Products retrieved successfully!",
      metadata: await ProductStrategy.searchProducts(req.body),
    }).send(res);
  };
}

module.exports = new ProductController();
