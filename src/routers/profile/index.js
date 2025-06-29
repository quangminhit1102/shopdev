"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { grantAccess } = require("../../middlewares/rbac.middleware");

const profileController = require("../../controllers/profile.controller");

router.get(
  "/viewAny",
  grantAccess("readAny", "profile"),
  profileController.profiles
);

router.get(
  "/viewOwn",
  grantAccess("readOwn", "profile"),
  profileController.profile
);

module.exports = router;
