"use strict";

const express = require("express");
const RBACController = require("../../controllers/rbac.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

// Resource endpoints
router.post("/resource", asyncHandler(RBACController.createResource));
router.get("/resource", asyncHandler(RBACController.resourceList));

// Role endpoints
router.post("/role", asyncHandler(RBACController.createRole));
router.get("/role", asyncHandler(RBACController.roleList));

module.exports = router;
