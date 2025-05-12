"use strict";

const CartService = require("../services/cart.service");
const { OK } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  checkoutReview = async (req, res) => {
    new OK({
      message: "Checkout review successfully",
      metadata: await CheckoutService.checkoutReview({
        ...req.body,
        user_id: req.user._id,
      }),
    }).send(res);
  };
}

module.exports = CheckoutController;
