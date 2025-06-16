"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const uploadController = require("../../controllers/upload.controller");
const { uploadMemory, uploadDisk } = require("../../configs/multer.config");

// Authentication required for all routes
// router.use(authenticateV2);

router.post("/", asyncHandler(uploadController.uploadImageFromURL));

router.post(
  "/thumb",
  uploadDisk.single("file"), // Use disk storage for thumbnail uploads single file
  asyncHandler(uploadController.uploadImageFromLocal)
);

router.post(
  "/thumbs",
  uploadDisk.array("file", 3), // Use disk storage for thumbnail uploads single file
  asyncHandler(uploadController.uploadImagesFromLocal)
);

module.exports = router;
