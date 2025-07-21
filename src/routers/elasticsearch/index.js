"use strict";

const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const ElasticsearchController = require("../../controllers/elasticsearch.controller");
const router = express.Router();

// Get Posts
router.get("/posts", asyncHandler(ElasticsearchController.getAllPosts));
// Create post
router.post("/posts", asyncHandler(ElasticsearchController.createPost));

// Search functionality
router.post("/posts/search", asyncHandler(ElasticsearchController.searchPosts));

// Get post by id
router.get("/posts/:id", asyncHandler(ElasticsearchController.removePost));

// Delete post by id
router.delete("/posts/:id", asyncHandler(ElasticsearchController.removePost));

// Update post by id
router.patch("/posts/:id", asyncHandler(ElasticsearchController.updatePost));

// Bulk operations
router.post("/posts/bulk", asyncHandler(ElasticsearchController.bulkPosts));

module.exports = router;
