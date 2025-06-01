"use strict";

const Comment = require("../models/comment.model");
const { NotFoundError } = require("../core/error.response");

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
      // Parent comment validation
      const parentComment = await Comment.findOne({
        comment_productId: product_id,
        _id: parent_id,
      });
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }

      // reply to a comment
      rightValue = parentComment.comment_right;

      // Update many comment has rightValue >= parentComment
      await Comment.updateMany(
        {
          comment_productId: product_id,
          comment_right: { $gte: rightValue },
        },
        { $inc: { comment_right: 2 } }
      );
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
    }
    // Insert to comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();
    return comment;
  }

  static async getCommentsByProductId({ product_id }) {
    return await Comment.find({ comment_productId: product_id }).sort({
      createdAt: -1,
    });
  }

  static async getCommentsByParentId({
    product_id,
    parent_id,
    limit = 10,
    skip = 0,
  }) {
    // Parent comment validation
    const parentComment = await Comment.findOne({
      comment_productId: product_id,
      _id: parent_id,
    });
    if (!parentComment) {
      throw new NotFoundError("Parent comment not found");
    }

    const comments = await Comment.find({
      comment_productId: product_id,
      comment_parentId: parent_id,
      comment_left: { $gt: parentComment.comment_left },
      comment_right: { $lt: parentComment.comment_right },
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_userId: 1,
        comment_parentId: 1,
        comment_productId: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return comments;
  }

  static async deleteComment({ comment_id, user_id, product_id }) {
    // validate product
    const product = await Comment.findOne({
      comment_productId: product_id,
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const comment = await Comment.findById(comment_id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    // Get Comment left and right value of the comment
    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;

    // Calculate the width of the comment
    const width = rightValue - leftValue + 1;

    // Delete the comments related to the comment
    await Comment.deleteMany({
      comment_productId: product_id,
      comment_left: { $gte: leftValue },
      comment_right: { $lte: rightValue },
    });

    // Update the left and right of back comments
    await Comment.updateMany(
      {
        comment_productId: product_id,
        comment_left: { $gt: rightValue },
      },
      { $inc: { comment_left: -width } }
    );

    await Comment.updateMany(
      {
        comment_productId: product_id,
        comment_right: { $gt: rightValue },
      },
      { $inc: { comment_right: -width } }
    );

    return await Comment.findByIdAndDelete(comment_id);
  }
}

module.exports = CommentService;
