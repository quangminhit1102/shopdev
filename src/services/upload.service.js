"use strict";

const cloudinary = require("../configs/cloudinary.config");

const uploadImageFromURL = async () => {
  // This function will handle uploading an image from a URL to Cloudinary
  // Implementation will go here
  try {
    const urlImage =
      "https://plus.unsplash.com/premium_photo-1749760305646-60673cae2c46?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Replace with the actual image URL
    const folderName = "product/shopId",
      newFilename = "product001";

    const result = await cloudinary.uploader.upload(urlImage, {
      folder: folderName,
      public_id: newFilename, // If you want to specify a custom filename, if not, Cloudinary will generate one
      resource_type: "image",
    });
    return result;
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw new Error("Failed to upload image from URL");
  }
};

// // Call the function to upload an image from a URL
// uploadImageFromURL().catch((error) => {
//   console.error("Upload failed:", error);
// });

module.exports = {
  uploadImageFromURL,
};
