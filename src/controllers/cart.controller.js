"use strict";

const CartService = require("../services/cart.service");
const { OK } = require("../core/success.response");

class CartController {
  addToCart = async (req, res) => {
    new OK({
      message: "Add to cart successfully",
      metadata: await CartService.createUserCart({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  updateCart = async (req, res) => {
    new OK({
      message: "Update cart successfully",
      metadata: await CartService.addToCartV2({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  deleteCart = async (req, res) => {
    new OK({
      message: "Delete cart successfully",
      metadata: await CartService.deleteCart({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  getCart = async (req, res) => {
    new OK({
      message: "Get cart successfully",
      metadata: await CartService.getCart({
        ...req.query,
        shop_id: req.user._id,
      }),
    }).send(res);
  };
}

module.exports = new CartController();
