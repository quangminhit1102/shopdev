"use strict";

const InventoryService = require("../services/inventory.service");
const { OK } = require("../core/success.response");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryInput:
 *       type: object
 *       required:
 *         - productId
 *         - stock
 *         - location
 *       properties:
 *         productId:
 *           type: string
 *         stock:
 *           type: number
 *         location:
 *           type: string
 */

class InventoryController {
  /**
   * @swagger
   * /shopdev/inventory:
   *   post:
   *     summary: Add inventory for a product
   *     tags: [Inventory]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InventoryInput'
   *     responses:
   *       201:
   *         description: Inventory added successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  addStockToInventory = async (req, res) => {
    new OK({
      message: "Add stock to inventory successfully",
      metadata: await InventoryService.addStockToInventory({
        ...req.body,
        shop_id: req.user._id,
      }),
    }).send(res);
  };

  /**
   * @swagger
   * /shopdev/inventory/{productId}:
   *   get:
   *     summary: Get inventory for a product
   *     tags: [Inventory]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Inventory details retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
   */
  getInventoryByProductId = async (req, res) => {
    // Implementation for getting inventory by product ID
  };
}

module.exports = new InventoryController();
