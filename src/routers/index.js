"use strict";

const express = require("express");
const router = express.Router();
const access = require("./access");

// Middleware to check API key
// router.use(require("../auth/checkAuth"));

// Access router
router.use("/shopdev", access);

// Export router
module.exports = router;
