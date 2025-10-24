"use strict";

/**
 * Cloudinary configuration module
 *
 * Required environment variables:
 * CLOUDINARY_CLOUD_NAME - Your Cloudinary cloud name
 * CLOUDINARY_API_KEY - Your Cloudinary API key
 * CLOUDINARY_API_SECRET - Your Cloudinary API secret
 *
 * Make sure to set these in your .env file:
 * CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */

const cloudinary = require("cloudinary").v2;

// Validate required environment variables
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export the configured Cloudinary instance
module.exports = cloudinary;
