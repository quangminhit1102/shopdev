const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const CommentController = require("../../controllers/comment.controller");
const router = express.Router();

// // Authentication middleware - required for all cart operations
// router.use(authenticateV2);

router.post("/", asyncHandler(CommentController.createComment));

router.get("/", asyncHandler(CommentController.getCommentsByProductId));

router.get("/parent", asyncHandler(CommentController.getCommentsByParentId));

router.delete("/:comment_id", asyncHandler(CommentController.deleteComment));

module.exports = router;
