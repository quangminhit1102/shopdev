"use strict";

const express = require("express");

const router = express.Router();

// Middleware to check API key
router.use(require("../auth/checkAuth"));

// Access router
router.use("/access", require("./access"));

// Export router
module.exports = router;
