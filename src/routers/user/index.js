"use strict";

const express = require("express");
const userController = require("../../controllers/user.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

router.post("/register-user", asyncHandler(userController.registerNewUser));

router.post("/verify-email", asyncHandler(userController.verifiedNewUser));

module.exports = router;
