"use strict";

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: number
 *     CartUpdateRequest:
 *       type: object
 *       required:
 *         - userId
 *         - product
 *       properties:
 *         userId:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/CartItem'
 */

const CartService = require("../services/cart.service");
const { OK } = require("../core/success.response");

class CartController {
  /**
   * @swagger
   * /shopdev/cart:
   *   post:
   *     summary: Add product to cart
   *     tags: [Cart]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CartUpdateRequest'
   *     responses:
   *       200:
   *         description: Product added to cart successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  addToCart = async (req, res) => {
    new OK({
      message: "Add to cart successfully",
      metadata: await CartService.createUserCart({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  /**
   * @swagger
   * /shopdev/cart:
   *   put:
   *     summary: Update cart
   *     tags: [Cart]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CartUpdateRequest'
   *     responses:
   *       200:
   *         description: Cart updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  updateCart = async (req, res) => {
    new OK({
      message: "Update cart successfully",
      metadata: await CartService.addToCartV2({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  /**
   * @swagger
   * /shopdev/cart:
   *   delete:
   *     summary: Delete cart
   *     tags: [Cart]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Cart deleted successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  deleteCart = async (req, res) => {
    new OK({
      message: "Delete cart successfully",
      metadata: await CartService.deleteCart({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  /**
   * @swagger
   * /shopdev/cart:
   *   get:
   *     summary: Get user's cart
   *     tags: [Cart]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Cart retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
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
