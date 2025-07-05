"use strict";

const express = require("express");
const router = express.Router();
const access = require("./access");
const product = require("./product");
const discount = require("./discount");
const comment = require("./comment");

// Middleware to check API key
// router.use(require("../auth/checkAuth"));

// Comment router
router.use("/shopdev/comment", comment);

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

// Notification router
router.use("/shopdev/notification", require("./notification"));

// Upload router
router.use("/shopdev/upload", require("./upload"));

// Profile router
router.use("/shopdev/profile", require("./profile"));

// RBAC router
router.use("/shopdev", require("./rbac"));

// Template router
router.use("/shopdev/template", require("./template.router"));

module.exports = router;
