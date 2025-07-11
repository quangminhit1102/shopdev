"use strict";

const cloudinary = require("../configs/cloudinary.config");
const crypto = require("crypto");
const urlImagePublic = `https://d3gmn25nrx25rn.cloudfront.net`;

const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("../configs/s3.config");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  getSignedUrl: getSignedUrlCloudfront,
} = require("@aws-sdk/cloudfront-signer");
const randomImageName = () => crypto.randomBytes(16).toString("hex");

//#region Using AWS
const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const imageName = randomImageName();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName, //file.originalname || "unknown",
      Body: file.buffer,
      ContentType: "image/jpeg",
    });
    const result = await s3.send(command);
    const signedURL = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
    });

    // Get signed URL S3
    const url = await getSignedUrl(s3, signedURL, { expiresIn: 3600 });

    // Get Signed URL Cloudfront
    const urlCloudfront = getSignedUrlCloudfront({
      url: `${urlImagePublic}/${imageName}`,
      keyPairId: process.env.AWS_CLOUDFRONT_PUBLIC_KEY, // Public key
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY, // Private key
      dateLessThan: new Date(Date.now() + 1000 * 60),
    });

    return { ...result, PublicURL: url, CloudfrontURL: urlCloudfront };
  } catch (error) {
    console.error("Error uploading image from local path:", error);
    throw new Error("Failed to upload image from local path");
  }
};

const deleteImageFromLocalS3 = async ({ key }) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const result = await s3.send(command);
    return result;
  } catch (error) {
    console.error("Error uploading image from local path:", error, path);
    throw new Error("Failed to upload image from local path");
  }
};

//#endregion

//#region Using Cloudinary
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

const uploadImageFromLocal = async ({
  path,
  folderName = "product/shopId",
}) => {
  // This function will handle uploading an image from a local path to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(path, {
      folder: folderName,
      public_id: "thumbnail",
    });
    return {
      result,
      thumbnail_url: cloudinary.url(result.public_id, {
        transformation: [
          { width: 300, height: 300, crop: "fill" }, // Resize to 300x300
          { quality: "auto" }, // Auto quality
        ],
      }),
    };
  } catch (error) {
    console.error("Error uploading image from local path:", error, path);
    throw new Error("Failed to upload image from local path");
  }
};

const uploadImagesFromLocal = async ({
  paths,
  folderName = "product/shopId",
}) => {
  // This function will handle uploading an image from a local path to Cloudinary
  try {
    const results = await uploadImages(paths, folderName);
    return results.map((result) => ({
      result,
      thumbnail_url: cloudinary.url(result.public_id, {
        transformation: [
          { width: 300, height: 300, crop: "fill" }, // Resize to 300x300
          { quality: "auto" }, // Auto quality
        ],
      }),
    }));
  } catch (error) {
    console.error("Error uploading image from local path:", error);
    throw new Error("Failed to upload image from local path");
  }
};

// Helper function to upload multiple images from local paths
const uploadImages = async (paths, folderName) => {
  let arrayResult = [];
  for (const path in paths) {
    const result = await cloudinary.uploader.upload(paths[path], {
      folder: folderName,
    });
    arrayResult.push(result);
  }
  return arrayResult;
};

//#endregion

module.exports = {
  uploadImageFromURL,
  uploadImageFromLocal,
  uploadImagesFromLocal,
  uploadImageFromLocalS3,
  deleteImageFromLocalS3,
};
