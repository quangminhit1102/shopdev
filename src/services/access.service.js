"use strict";
const shopModel = require("../models/shop.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
        code: 400,
        message: "Login failed",
        error: error.message,
      };
    }
  }

  static async register({ name, email, password }) {
    try {
      // Input validation would go here
      const secretKey = process.env.JWT_SECRET || "your-secret-key";
      const verificationToken = JWT.sign(
        { email: email, timestamp: Date.now() },
        secretKey,
        { expiresIn: "1d" }
      );

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      password = hashedPassword;

      // Email already exists
      const existingUser = await shopModel
        .findOne({ email })
        .lean() // .lean() to return a plain JavaScript object instead of a Mongoose document
        .exec(); // .exec() to execute the query and return a promise;
      if (existingUser) {
        return {
          code: 400,
          message: "Email already exists",
        };
      }

      const newShop = await shopModel.create({
        name,
        email,
        password, // Should be hashed before storing
        verified: false,
      });

      if (newShop) {
        // Create private key and public key for shop
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
        });
        console.log(privateKey, publicKey);
      }

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
        success: false,
        message: "Registration failed",
        statusCode: 500,
        errors: error.message,
      };
    }
  }
}

module.exports = AccessService;
