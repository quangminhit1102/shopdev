"use strict";

const express = require("express");
const router = express.Router();

router.get("", (req, res, next) => {
  res.send("Hello world");
});

router.post("/login", (req, res, next) => {
  res.send("Login");
});

router.post("/register", (req, res, next) => {
  res.send("Register");
});

module.exports = router;
