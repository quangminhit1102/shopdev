"use strict";

const Comment = require("../models/comment.model");
const { NotFoundError } = require("../core/error.response");

/*
    Key features of the Comment Service:
    1. Add a new comment [User | Shop]
    2. Get a list comments by product ID [User | Shop]
    3. Delete a comment [User | Shop | Admin]
*/

/**
 * CommentService provides methods to add, retrieve, and delete comments using the Nested Set Model.
 * The Nested Set Model allows efficient querying of hierarchical comment threads (replies, sub-replies, etc).
 * Each comment stores two values: comment_left and comment_right, which define its position in the tree.
 *
 * Key Nested Set Model Concepts:
 * - Each node (comment) is assigned a left and right value during a depth-first traversal.
 * - All descendants of a comment have left/right values between their parent's left and right.
 * - Inserting or deleting a comment requires updating left/right values of other comments to maintain the structure.
 */
class CommentService {
  /**
   * Add a new comment or reply to a product.
   * If parent_id is provided, the comment is a reply; otherwise, it's a root comment.
   *
   * Nested Set Model Algorithm:
   * - For a reply: Find the parent's right value. Increment all comments' left/right >= parent's right by 2 to make space.
   * - For a root: Find the max right value among all comments for the product. Place the new comment at the end.
   * - Assign left = rightValue, right = rightValue + 1 for the new comment.
   *
   * @param {Object} param0 - { product_id, user_id, content, parent_id }
   * @returns {Promise<Comment>} The created comment document
   */
  static async addComment({ product_id, user_id, content, parent_id = null }) {
    // Create a new comment instance
    const comment = new Comment({
      comment_productId: product_id,
      comment_userId: user_id,
      comment_content: content,
      comment_parentId: parent_id,
    });

    let rightValue;

    if (parent_id) {
      // Validate that the parent comment exists for the given product
      const parentComment = await Comment.findOne({
        comment_productId: product_id,
        _id: parent_id,
      });
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }

      // Set rightValue to the parent's right value (where the reply will be inserted)
      rightValue = parentComment.comment_right;

      // Make space for the new comment by incrementing right values of all comments to the right
      await Comment.updateMany(
        {
          comment_productId: product_id,
          comment_right: { $gte: rightValue },
        },
        { $inc: { comment_right: 2 } }
      );
    } else {
      // Find the maximum right value among all comments for the product (for root comments)
      const maxRightValue = await Comment.findOne({
        comment_productId: product_id,
      })
        .sort({ comment_right: -1 })
        .select("comment_right");

      if (maxRightValue) {
        // If there are existing comments, set rightValue to maxRightValue + 1
        rightValue = maxRightValue.comment_right + 1;
      } else {
        // If no comments exist, set rightValue to 1 (first comment)
        rightValue = 1;
      }
    }
    // Assign left and right values for the new comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    // Save the new comment to the database
    await comment.save();
    return comment;
  }

  /**
   * Get all comments for a product, sorted by creation date (flat list).
   *
   * @param {Object} param0 - { product_id }
   * @returns {Promise<Array>} List of comments for the product
   */
  static async getCommentsByProductId({ product_id }) {
    // Find all comments for the product and sort by creation date (descending)
    return await Comment.find({ comment_productId: product_id }).sort({
      createdAt: -1,
    });
  }

  /**
   * Get all direct replies (children) to a parent comment for a product.
   * Uses the Nested Set Model to efficiently find all descendants within the parent's left/right range.
   *
   * @param {Object} param0 - { product_id, parent_id, limit, skip }
   * @returns {Promise<Array>} List of child comments
   */
  static async getCommentsByParentId(params) {
    const { product_id, parent_id, limit = 10, skip = 0 } = params;

    // Validate that the parent comment exists for the given product
    const parentComment = await Comment.findOne({
      comment_productId: product_id,
      _id: parent_id,
    });
    if (!parentComment) {
      throw new NotFoundError("Parent comment not found");
    }

    // Find all child comments whose left/right are within the parent's left/right range
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

  /**
   * Delete a comment and all its replies (subtree) for a product.
   *
   * Nested Set Model Algorithm:
   * - Find the left/right values of the comment to delete.
   * - Delete all comments with left/right between those values (removes the subtree).
   * - Decrement left/right values of all comments to the right of the deleted subtree by the subtree width.
   *
   * @param {Object} param0 - { comment_id, user_id, product_id }
   * @returns {Promise<Comment|null>} The deleted comment document
   */
  static async deleteComment({ comment_id, user_id, product_id }) {
    // Validate that the product exists (at least one comment for the product)
    const product = await Comment.findOne({
      comment_productId: product_id,
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Find the comment to delete
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    // Get the left and right values of the comment (subtree boundaries)
    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;

    // Calculate the width of the subtree to be deleted
    const width = rightValue - leftValue + 1;

    // Delete all comments in the subtree (left/right within the boundaries)
    await Comment.deleteMany({
      comment_productId: product_id,
      comment_left: { $gte: leftValue },
      comment_right: { $lte: rightValue },
    });

    // Update left values of comments to the right of the deleted subtree
    await Comment.updateMany(
      {
        comment_productId: product_id,
        comment_left: { $gt: rightValue },
      },
      { $inc: { comment_left: -width } }
    );

    // Update right values of comments to the right of the deleted subtree
    await Comment.updateMany(
      {
        comment_productId: product_id,
        comment_right: { $gt: rightValue },
      },
      { $inc: { comment_right: -width } }
    );

    // Delete the comment itself (if not already deleted above)
    return await Comment.findByIdAndDelete(comment_id);
  }
}

module.exports = CommentService;
