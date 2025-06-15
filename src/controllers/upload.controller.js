"use strict";

const uploadService = require("../services/upload.service");
const { OK } = require("../core/success.response");

/**
 * NotificationController handles HTTP requests related to notifications.
 */
class UploadController {
  /**
   * Upload a file.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async uploadImageFromURL(req, res) {
    const file = req.file; // Assuming multer middleware is used for file uploads
    const result = await uploadService.uploadImageFromURL(file);
    new OK({
      message: "File uploaded successfully",
      metadata: result,
    }).send(res);
  }

  /**
   * Upload a file.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async uploadImageFromLocal(req, res) {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await uploadService.uploadImageFromLocal({
      path: file.path,
    });
    new OK({
      message: "File uploaded successfully",
      metadata: result,
    }).send(res);
  }
}

module.exports = UploadController;
