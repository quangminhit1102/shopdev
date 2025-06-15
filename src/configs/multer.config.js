"use strict";

const multer = require("multer");

const uploadMemory = multer.memoryStorage();
const uploadDisk = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/uploads"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

module.exports = {
  uploadMemory: multer({ storage: uploadMemory }),
  uploadDisk: multer({ storage: uploadDisk }),
};
