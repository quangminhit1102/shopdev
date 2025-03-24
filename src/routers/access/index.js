"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

router.get("", (req, res, next) => {
  AccessService.getAccess()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post("/login", asyncHandler(AccessController.login));

router.post("/register", asyncHandler(AccessController.register));

module.exports = router;
