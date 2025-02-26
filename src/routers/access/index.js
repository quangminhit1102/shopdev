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
  const { email, password } = req.body;
  AccessService.login({ email, password })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(400).json({
        code: "xxx",
        message: error.message,
      });
    });
});

router.post("/register", (req, res, next) => {
  const { name, email, password } = req.body;
  AccessService.register({ name, email, password })
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.status(400).json({
        code: "xxx",
        message: error.message,
      });
    });
});

module.exports = router;
