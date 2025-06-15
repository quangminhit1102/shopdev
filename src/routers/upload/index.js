"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const uploadController = require("../../controllers/upload.controller");
const AccessController = require("../../controllers/access.controller");

// Authentication required for all routes
// router.use(authenticateV2);

router.post("/", asyncHandler(uploadController.uploadImageFromURL));

module.exports = router;
