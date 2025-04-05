"use strict";

const express = require("express");
const router = express.Router();
const access = require("./access");
const product = require("./product");

// Middleware to check API key
// router.use(require("../auth/checkAuth"));

// Access router
router.use("/shopdev", access);

// product router
router.use("/shopdev/product", product);

// Export router
module.exports = router;
