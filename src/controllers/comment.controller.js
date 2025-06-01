"use strict";

const CommentService = require("../services/comment.service");
const { OK } = require("../core/success.response");

class CommentController {
  createComment = async (req, res, next) => {
    new OK({
      message: "Create comment successfully",
      metadata: await CommentService.addComment({
        ...req.body,
      }),
    }).send(res);
  };

  getCommentsByProductId = async (req, res, next) => {
    new OK({
      message: "Get comments by product ID successfully",
      metadata: await CommentService.getCommentsByProductId({
        ...req.body,
      }),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new OK({
      message: "Get comments by parent ID successfully",
      metadata: await CommentService.getCommentsByParentId({
        ...req.body,
      }),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new OK({
      message: "Delete comment successfully",
      metadata: await CommentService.deleteComment({
        ...req.body,
        comment_id: req.params.comment_id,
      }),
    }).send(res);
  };
}

module.exports = new CommentController();
