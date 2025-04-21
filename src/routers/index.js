"use strict";

const express = require("express");
const router = express.Router();
const access = require("./access");
const product = require("./product");

// Middleware to check API key
// router.use(require("../auth/checkAuth"));

// product router
router.use("/shopdev/product", product);

// Access router
router.use("/shopdev", access);

// Export router
module.exports = router;
