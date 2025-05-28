"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const router = express.Router();

router.post("/login", asyncHandler(AccessController.login));

router.post("/register", asyncHandler(AccessController.register));

router.get("", asyncHandler(AccessController.getAccess));

// Authentication
router.use(authenticateV2);

router.post("/logout", asyncHandler(AccessController.logout));

router.post("/refresh-Token", asyncHandler(AccessController.refresh));

module.exports = router;
