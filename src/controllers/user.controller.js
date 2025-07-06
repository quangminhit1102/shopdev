"use strict";
const userService = require("../services/user.service");
const { OK } = require("../core/success.response");

class UserController {
  // Create new user
  registerNewUser = async (req, res) => {
    new OK({
      message:
        "Email registration successful! Please check your inbox to verify your account.",
      metadata: await userService.registerNewUser({
        email: req.body.email,
      }),
    }).send(res);
  };

  // Check registered user via email
  verifiedNewUser = async (req, res) => {
    new OK({
      message: "Email verification successful!",
      metadata: await userService.verifiedNewUser(req.query),
    }).send(res);
  };
}

module.exports = new UserController();
