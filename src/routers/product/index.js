"use strict";

const express = require("express");
const AccessController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
const { authenticate } = require("../../auth/authUtils");

// Authentication
router.use(asyncHandler(authenticate));

router.post("/create", asyncHandler(AccessController.createProduct));

module.exports = router;
