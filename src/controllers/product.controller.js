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
    new CREATED({
      message: "Product published successfully!",
      metadata: await ProductStrategy.publishProduct({
        product_shop: req.user?._id,
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  unPublishProduct = async (req, res) => {
    new CREATED({
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
    new CREATED({
      message: "Published products retrieved successfully!",
      metadata: await ProductStrategy.findAllPublishedProductsOfShop({
        product_shop: req.user?._id,
      }),
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
