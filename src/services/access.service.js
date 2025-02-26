"use strict";
const shopModel = require("../models/shop.model");
const JWT = require("jsonwebtoken");

class AccessService {
  static async getAccess() {
    let a = shopModel.findOne();
    console.log(a);
    return "Hello world";
  }

  static async login() {
    try {
      const secretKey = process.env.JWT_SECRET || "your-secret-key";

      // Assuming credentials would be passed to login method
      // Replace this with actual user validation
      const userInfo = { userId: 1, email: "test@example.com" };

      const token = await JWT.sign(userInfo, secretKey, {
        expiresIn: "2d",
      });

      return {
        code: 200,
        message: "Login successful",
        token,
      };
    } catch (error) {
      return {
        code: 500,
        message: "Login failed",
        error: error.message,
      };
    }
  }

  static async register() {
    try {
      // Input validation would go here
      const secretKey = process.env.JWT_SECRET || "your-secret-key";
      const verificationToken = JWT.sign(
        { email: email, timestamp: Date.now() },
        secretKey,
        { expiresIn: "1d" }
      );

      // Create new shop/user in database
      // This is a placeholder - implement actual database creation
      const newShop = await shopModel.create({
        email,
        password, // Should be hashed before storing
        verified: false,
        verificationToken,
      });

      // Send verification email
      // Implement email sending logic here

      return {
        code: 201,
        message:
          "Registration successful. Please check your email to verify account.",
        data: { email: newShop.email },
      };
    } catch (error) {
      return {
        code: 500,
        message: "Registration failed",
        error: error.message,
      };
    }
  }
}

module.exports = AccessService;
