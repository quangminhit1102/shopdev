"use strict";

const express = require("express");

const router = express.Router();

// Access router
router.use("/access", require("./access"));

// Export router
module.exports = router;
