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
}

module.exports = new CommentController();
