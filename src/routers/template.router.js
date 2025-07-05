"use strict";
const express = require("express");
const TemplateController = require("../controllers/template.controller");
const router = express.Router();

// Create
router.post("/", TemplateController.create);
// List all
router.get("/", TemplateController.list);
// Get one
router.get("/:id", TemplateController.get);
// Update
router.put("/:id", TemplateController.update);
// Delete
router.delete("/:id", TemplateController.delete);

module.exports = router;
