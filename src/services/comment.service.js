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

    let rightValue;

    if (parent_id) {
      // reply to a comment
    } else {
      const maxRightValue = await Comment.findOne({
        comment_productId: product_id,
      })
        .sort({ comment_right: -1 })
        .select("comment_right");

      if (maxRightValue) {
        // If there are existing comments, set rightValue to maxRightValue + 2
        rightValue = maxRightValue.comment_right + 1;
      } else {
        // If no comments exist, set rightValue to 1
        rightValue = 1;
      }

      // Insert to comment
      comment.comment_left = rightValue;
      comment.comment_right = rightValue + 1;

      await comment.save();
      return comment;
    }

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

module.exports = CommentService;
