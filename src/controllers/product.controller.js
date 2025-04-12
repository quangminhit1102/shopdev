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
      message: "Product created successfully",
      metadata: await ProductStrategy.createProduct(req.body),
    }).send(res);
  };
}

module.exports = new ProductController();
