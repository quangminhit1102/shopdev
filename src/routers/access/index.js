"use strict";

const express = require("express");
const AccessService = require("../../services/access.service");
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

router.post("/login", (req, res, next) => {
  res.send("Login");
});

router.post("/register", (req, res, next) => {
  res.send("Register");
});

module.exports = router;
