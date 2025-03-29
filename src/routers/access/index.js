"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticate } = require("../../auth/authUtils");
const router = express.Router();

router.post("/login", asyncHandler(AccessController.login));

router.post("/register", asyncHandler(AccessController.register));

// Authentication
router.use(asyncHandler(authenticate));

router.post("/logout", asyncHandler(AccessController.logout));

router.get("", asyncHandler(AccessController.getAccess));

module.exports = router;
