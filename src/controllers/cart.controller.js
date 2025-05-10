"use strict";

const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res) => {
    new OK({
      message: "Add to cart successfully",
      metadata: await CartService.addToCart({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  updateCart = async (req, res) => {
    new OK({
      message: "Update cart successfully",
      metadata: await CartService.updateCart({
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
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };
}

module.exports = new CartController();
