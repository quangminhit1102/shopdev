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
}

module.exports = new CommentService();
