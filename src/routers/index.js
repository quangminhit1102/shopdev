"use strict";

const express = require("express");
const router = express.Router();
const access = require("./access");
const product = require("./product");
const discount = require("./discount");

// Middleware to check API key
// router.use(require("../auth/checkAuth"));

// Product router
router.use("/shopdev/product", product);

// Access router
router.use("/shopdev", access);

// Inventory router
router.use("/shopdev/inventory", require("./inventory"));

// Discount router
router.use("/shopdev/discount", discount);

// Cart router
router.use("/shopdev/cart", require("./cart"));

// Checkout router
router.use("/shopdev/checkout", require("./checkout"));

// Order router
router.use("/shopdev/orders", require("./order"));

// Comment router
router.use("/shopdev/comment", require("./comment"));

module.exports = router;
