"use strict";

const multer = require("multer");

/**
 * Multer configuration
 *
 * This module exports two pre-configured multer middleware instances:
 * - uploadMemory: saves uploaded files in memory (req.file.buffer) using MemoryStorage
 * - uploadDisk: saves uploaded files to disk using DiskStorage under ./src/uploads
 *
 * Notes / recommendations:
 * - MemoryStorage keeps the entire file in server memory. It's useful for small files
 *   and when you want to immediately stream the file to a remote service (e.g. S3).
 *   Avoid for large files or high-concurrency environments to prevent OOM issues.
 * - DiskStorage writes files to the local filesystem. Ensure the destination directory
 *   exists and is writable in your deployment environment. For production, prefer an
 *   absolute path or a dedicated persistent volume.
 * - Consider adding `limits` (e.g. fileSize) and `fileFilter` to each multer instance
 *   to enforce file size/type constraints. Example:
 *     multer({ storage: uploadDisk, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })
 *
 * Usage examples:
 *   const { uploadMemory, uploadDisk } = require('../configs/multer.config');
 *   // single file to memory
 *   app.post('/upload', uploadMemory.single('file'), (req, res) => {
 *     // req.file.buffer contains the file bytes
 *   });
 *
 *   // multiple files to disk
 *   app.post('/photos', uploadDisk.array('photos', 5), (req, res) => {
 *     // req.files contains metadata and paths
 *   });
 */

// Memory storage - stores files in RAM (req.file.buffer). Use for small, ephemeral uploads.
const uploadMemory = multer.memoryStorage();

// Disk storage - writes files to disk. Customize destination/filename as needed.
const uploadDisk = multer.diskStorage({
  destination: (req, file, cb) => {
    // Relative path used here; consider using an absolute path in production.
    // Ensure this folder exists and has proper permissions.
    cb(null, "./src/uploads");
  },
  filename: (req, file, cb) => {
    // Prefix the original filename with a timestamp to reduce collisions.
    // You may want to sanitize `file.originalname` or use UUIDs instead.
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

module.exports = {
  // Stores uploads in memory. The uploaded file buffer is available at req.file.buffer.
  // Good for immediate processing (e.g. image resizing) or streaming to external stores.
  uploadMemory: multer({ storage: uploadMemory }),

  // Stores uploads on disk under ./src/uploads. To restrict file size or types,
  // add `limits` and/or `fileFilter` options when creating the multer instance.
  uploadDisk: multer({ storage: uploadDisk }),
};
