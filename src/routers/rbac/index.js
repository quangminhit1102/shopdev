"use strict";

const express = require("express");
const RbacController = require("../../controllers/rbac.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

// Resource endpoints
router.post("/resource", asyncHandler(RbacController.createResource));
router.get("/resource", asyncHandler(RbacController.resourceList));

// Role endpoints
router.post("/role", asyncHandler(RbacController.createRole));
router.get("/role", asyncHandler(RbacController.roleList));

module.exports = router;
