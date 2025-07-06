"use strict";

const { BadRequestError } = require("../core/error.response");
const otpModel = require("../models/otp.model");
const userModel = require("../models/user.model");
const templateService = require("./template.service");
const crypto = require("crypto");
const { sentEmailAsync } = require("./email.service");
const bcrypt = require("bcrypt");

const registerNewUser = async ({ email = null, captcha = null }) => {
  // 1. Check if email already exists in the database
  const user = await userModel.findOne({ email }).lean();
  if (user) {
    throw new BadRequestError("Email already registered");
  }

  // 2. If email is not registered, Send a verification email
  // 2.1 Generate a verification token
  const token = crypto.randomBytes(32).toString("hex");

  // 2.2 Create a OTP document
  const otp = new otpModel({
    otp_email: email,
    otp_token: token,
  });
  await otp.save();

  // 2.3 Get Email template from the database
  const template = await templateService.getTemplateById("verify_email");

  // 2.4 Send the verification email
  const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}&email=${email}`;
  const emailSent = await sentEmailAsync(
    email,
    "[Welcome] Verify your email to code the world!",
    template.template_html
      .replace("{{VERIFICATION_LINK}}", verificationLink)
      .replace("{{EMAIL}}", email)
  );
  if (!emailSent) {
    throw new BadRequestError("Failed to send verification email");
  }
};

const verifiedNewUser = async ({ email = null, token = null }) => {
  // 1. Check if the OTP exists for the given email and token
  const otp = await otpModel
    .findOne({ otp_email: email, otp_token: token })
    .lean();
  if (!otp) {
    throw new BadRequestError("Invalid or expired verification token");
  }

  // 2. If OTP is valid, create a new user
  // 2.1 Check if the user already exists
  const existingUser = await userModel.findOne({ email }).lean();
  if (existingUser) {
    throw new BadRequestError("User already exists with this email");
  }
  // 2.2 Create a new user with the email with random password
  const randomPassword = crypto.randomBytes(16).toString("hex");
  // 2.3 Hash password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  const newUser = new userModel({
    user_email: email,
    user_password: hashedPassword,
    user_name: email.split("@")[0],
    user_role: "user",
    user_salt: salt,
  });
  await newUser.save();

  // 3. Delete the OTP document
  await otpModel.deleteOne({ _id: otp._id });

  // 4. Send a welcome email with the random password
  const welcomeTemplate = await templateService.getTemplateById(
    "welcome_email"
  );
  const emailSent = await sentEmailAsync(
    email,
    "[Welcome] Your account has been created",
    welcomeTemplate.template_html
      .replace("{{EMAIL}}", email)
      .replace("{{PASSWORD}}", randomPassword)
  );
  if (!emailSent) {
    throw new BadRequestError("Failed to send welcome email");
  }

  return newUser;
};

module.exports = {
  registerNewUser,
  verifiedNewUser,
};
