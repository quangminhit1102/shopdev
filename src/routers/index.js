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

// Discount router
router.use("/shopdev/discount", discount);

// Cart router
router.use("/shopdev/cart", require("./cart"));

// checkout router
router.use("/shopdev/checkout", require("./checkout"));

module.exports = router;
