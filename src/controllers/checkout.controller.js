"use strict";

const CartService = require("../services/cart.service");
const { OK } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout process endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutReviewRequest:
 *       type: object
 *       required:
 *         - cartId
 *       properties:
 *         cartId:
 *           type: string
 *         discountCode:
 *           type: string
 *         userId:
 *           type: string
 */

class CheckoutController {
  /**
   * @swagger
   * /shopdev/checkout/review:
   *   post:
   *     summary: Review checkout details
   *     tags: [Checkout]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CheckoutReviewRequest'
   *     responses:
   *       200:
   *         description: Checkout details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalAmount:
   *                   type: number
   *                 totalItems:
   *                   type: number
   *                 discount:
   *                   type: number
   *                 finalAmount:
   *                   type: number
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Cart not found
   *       500:
   *         description: Server error
   */
  checkoutReview = async (req, res) => {
    new OK({
      message: "Checkout review successfully",
      metadata: await CheckoutService.checkoutReview({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };
}

module.exports = new CheckoutController();
