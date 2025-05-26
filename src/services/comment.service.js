"use strict";

const Comment = require("../models/comment.model");

/*
    Key features of the Comment Service:
    1. Add a new comment [User | Shop]
    2. Get a list comments by product ID [User | Shop]
    3. Delete a comment [User | Shop | Admin]
*/

class CommentService {
  static async addComment({ product_id, user_id, content, parent_id = null }) {
    const comment = new Comment({
      comment_productId: product_id,
      comment_userId: user_id,
      comment_content: content,
      comment_parentId: parent_id,
    });
    return await comment.save();
  }

  static async getCommentsByProductId(product_id) {
    return await Comment.find({ comment_productId: product_id })
      .populate("comment_userId", "user_name user_avatar")
      .sort({ createdAt: -1 });
  }

  static async deleteComment(comment_id, user_id) {
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.comment_userId.toString() !== user_id.toString()) {
      throw new Error("You do not have permission to delete this comment");
    }
    return await Comment.findByIdAndDelete(comment_id);
  }
}

module.exports = new CommentService();
