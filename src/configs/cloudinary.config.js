"use strict";

const cloudinary = require("cloudinary").v2;
const CLOUDINARY_CLOUD_NAME = "dxrn7tjcq",
  CLOUDINARY_API_KEY = "181157928838848",
  CLOUDINARY_API_SECRET = "6e4td4oHa5DhyFXwVj_vReYsXzo";

console.log(process.env);
// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
// Export the configured Cloudinary instance
module.exports = cloudinary;
