"use strict";

const { OK } = require("../core/success.response");
const OrderService = require("../services/order.service");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderInput:
 *       type: object
 *       required:
 *         - userId
 *         - shipping
 *         - payment
 *         - products
 *       properties:
 *         userId:
 *           type: string
 *         shipping:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             zipCode:
 *               type: string
 *         payment:
 *           type: object
 *           properties:
 *             method:
 *               type: string
 *             status:
 *               type: string
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 */

/**
 * @swagger
 * /v1/api/order:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order in the system
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
class OrderController {
  /**
   * @swagger
   * /v1/api/order/user/{userId}:
   *   get:
   *     summary: Get all orders for a user
   *     description: Retrieves all orders associated with a specific user
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [ctime, mtime]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of orders retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: No orders found
   */
  getOrdersByUser = async (req, res) => {
    const orders = await OrderService.getOrdersByUser(req.user._id);
    new OK({
      message: "Get orders successfully",
      metadata: orders,
    }).send(res);
  };

  /**
   * @swagger
   * /v1/api/order/{orderId}:
   *   get:
   *     summary: Get a specific order
   *     description: Retrieves a specific order by its ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Order not found
   */
  getOneOrderByUser = async (req, res) => {
    const order = await OrderService.getOneOrderByUser(
      req.user._id,
      req.params.id
    );
    new OK({
      message: "Get order successfully",
      metadata: order,
    }).send(res);
  };

  /**
   * @swagger
   * /v1/api/order/{orderId}:
   *   delete:
   *     summary: Cancel an order
   *     description: Cancels a specific order by its ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Order cancelled successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Order not found
   */
  cancelOrder = async (req, res) => {
    const order = await OrderService.cancelOrder(req.user._id, req.params.id);
    new OK({
      message: "Cancel order successfully",
      metadata: order,
    }).send(res);
  };

  /**
   * @swagger
   * /v1/api/order/{orderId}:
   *   patch:
   *     summary: Update an order
   *     description: Updates a specific order by its ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *               shipping:
   *                 type: object
   *               trackingStatus:
   *                 type: string
   *     responses:
   *       200:
   *         description: Order updated successfully
   *       400:
   *         description: Invalid update data
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Order not found
   */
  updateOrder = async (req, res) => {
    const order = await OrderService.updateOrder(
      req.user._id,
      req.params.id,
      req.body
    );
    new OK({
      message: "Update order successfully",
      metadata: order,
    }).send(res);
  };
}

module.exports = OrderController;
