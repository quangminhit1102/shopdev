"use strict";

const elasticClient = require("../dbs/elastic-client");
const { OK, CREATED } = require("./../core/success.response");

/**
 * @class ElasticsearchController
 * @description Controller for managing Elasticsearch operations including CRUD and search functionality
 *
 * Index Structure:
 * - post_v001: Main index for blog posts
 *   Fields:
 *   - title: Text field for post title
 *   - author: Keyword field for author name
 *   - content: Text field for post content
 */
class ElasticsearchController {
  // Index name constant to avoid magic strings
  static INDEX_NAME = "post_v001";

  /**
   * Helper method to handle common error responses
   * @private
   */
  _handleError(res, error, operation) {
    console.error(`Error in ${operation}:`, error);
    const status = error.meta?.statusCode || 500;
    res.status(status).json({
      message: `Error during ${operation}`,
      error: error.message,
    });
  }

  /**
   * Helper method to validate document fields
   * @private
   */
  _validateDocument(doc) {
    const requiredFields = ["title", "author", "content"];
    const missingFields = requiredFields.filter((field) => !doc[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }
  /**
   * Create a new post in Elasticsearch
   * @route POST /posts
   * @param {object} req.body - Post data
   * @param {string} req.body.title - Post title
   * @param {string} req.body.author - Post author
   * @param {string} req.body.content - Post content
   * @returns {object} Created post data
   */
  createPost = async (req, res) => {
    try {
      this._validateDocument(req.body);

      const result = await elasticClient.index({
        index: ElasticsearchController.INDEX_NAME,
        body: {
          document: {
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            created_at: new Date().toISOString(),
          },
        },
      });

      new CREATED({
        message: "Post created successfully",
        metadata: {
          id: result.body._id,
          ...result.body,
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "create post");
    }
  };

  /**
   * Remove a post from Elasticsearch
   * @route DELETE /posts/:id
   * @param {string} req.params.id - Post ID to delete
   * @returns {object} Deletion confirmation
   */
  removePost = async (req, res) => {
    try {
      const { id } = req.params;

      // Check if document exists before deleting
      const exists = await elasticClient.exists({
        index: ElasticsearchController.INDEX_NAME,
        id,
      });

      if (!exists.body) {
        return res.status(404).json({
          message: `Post with ID ${id} not found`,
        });
      }

      const result = await elasticClient.delete({
        index: ElasticsearchController.INDEX_NAME,
        id,
      });

      new OK({
        message: "Post removed successfully",
        metadata: {
          id,
          result: result.body.result,
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "remove post");
    }
  };

  /**
   * Search posts with advanced query options
   * @route GET /posts/search
   * @param {string} req.query.q - Search query string
   * @param {string} [req.query.sort] - Sort field and order (e.g., "created_at:desc")
   * @param {number} [req.query.from=0] - Starting index for pagination
   * @param {number} [req.query.size=10] - Number of results per page
   * @returns {object} Search results with metadata
   */
  searchPosts = async (req, res) => {
    try {
      const { q, sort, from = 0, size = 10 } = req.query;

      // Build search query
      const searchQuery = {
        index: ElasticsearchController.INDEX_NAME,
        body: {
          query: {
            simple_query_string: {
              query: q || "*",
              fields: ["title^2", "content", "author"], // Boost title relevance
              default_operator: "OR",
              analyze_wildcard: true,
            },
          },
          from: parseInt(from),
          size: parseInt(size),
          highlight: {
            fields: {
              title: {},
              content: {
                fragment_size: 150,
                number_of_fragments: 3,
              },
            },
          },
        },
      };

      // Add sorting if specified
      if (sort) {
        const [field, order] = sort.split(":");
        searchQuery.body.sort = { [field]: { order: order || "desc" } };
      }

      const result = await elasticClient.search(searchQuery);

      new OK({
        message: "Search completed successfully",
        metadata: {
          total: result.body.hits.total,
          took: result.body.took,
          hits: result.body.hits.hits.map((hit) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
            highlights: hit.highlight,
          })),
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "search posts");
    }
  };

  /**
   * Update a post in Elasticsearch
   * @route PATCH /posts/:id
   * @param {string} req.params.id - Post ID to update
   * @param {object} req.body - Update data
   * @param {string} [req.body.title] - Updated post title
   * @param {string} [req.body.author] - Updated post author
   * @param {string} [req.body.content] - Updated post content
   * @returns {object} Updated post data
   */
  updatePost = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, content } = req.body;

      // Check if at least one field to update is provided
      if (!title && !author && !content) {
        return res.status(400).json({
          message:
            "At least one field (title, author, or content) must be provided for update",
        });
      }

      // Check if document exists before updating
      const exists = await elasticClient.exists({
        index: ElasticsearchController.INDEX_NAME,
        id,
      });

      if (!exists.body) {
        return res.status(404).json({
          message: `Post with ID ${id} not found`,
        });
      }

      const result = await elasticClient.update({
        index: ElasticsearchController.INDEX_NAME,
        id,
        body: {
          doc: {
            ...(title && { title }),
            ...(author && { author }),
            ...(content && { content }),
            updated_at: new Date().toISOString(),
          },
        },
        refresh: true, // Ensure the update is immediately visible
      });

      new OK({
        message: "Post updated successfully",
        metadata: {
          id,
          result: result.body.result,
          version: result.body._version,
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "update post");
    }
  };

  /**
   * Get all posts with pagination and sorting
   * @route GET /posts
   * @param {number} [req.query.page=1] - Page number
   * @param {number} [req.query.limit=10] - Number of posts per page
   * @param {string} [req.query.sort=created_at:desc] - Sort field and order
   * @param {string} [req.query.fields] - Comma-separated list of fields to return
   * @returns {object} Paginated list of posts with metadata
   */
  getAllPosts = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || "created_at:desc";
      const fields = req.query.fields?.split(",") || [];

      // Calculate offset
      const from = (page - 1) * limit;

      // Build search query
      const searchQuery = {
        index: ElasticsearchController.INDEX_NAME,
        body: {
          query: { match_all: {} },
          from,
          size: limit,
          sort: [],
          _source: fields.length > 0 ? fields : true,
        },
      };

      // Add sorting
      const [sortField, sortOrder] = sort.split(":");
      searchQuery.body.sort.push({
        [sortField]: { order: sortOrder || "desc" },
      });

      const result = await elasticClient.search(searchQuery);

      // Calculate pagination metadata
      const total = result.body.hits.total.value;
      const totalPages = Math.ceil(total / limit);

      new OK({
        message: "Posts retrieved successfully",
        metadata: {
          posts: result.body.hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "get all posts");
    }
  };

  /**
   * Perform bulk operations on posts
   * @route POST /posts/bulk
   * @param {Array} req.body.operations - Array of operations to perform
   * @param {Object} [req.body.operations[].index] - Index operation data
   * @param {Object} [req.body.operations[].update] - Update operation data
   * @param {Object} [req.body.operations[].delete] - Delete operation data
   * @returns {Object} Bulk operation results
   *
   * @example
   * // Request body example:
   * {
   *   "operations": [
   *     { "index": { "title": "Post 1", "author": "John", "content": "Content 1" }},
   *     { "update": { "id": "123", "doc": { "title": "Updated Post" }}},
   *     { "delete": { "id": "456" }}
   *   ]
   * }
   */
  bulkPosts = async (req, res) => {
    try {
      const { operations } = req.body;

      if (!operations?.length) {
        return res.status(400).json({
          message: "Operations array is required and must not be empty",
        });
      }

      // Validate operations
      for (const op of operations) {
        const operationType = Object.keys(op)[0];
        if (!["index", "update", "delete"].includes(operationType)) {
          return res.status(400).json({
            message: `Invalid operation type: ${operationType}. Must be one of: index, update, delete`,
          });
        }
      }

      // Prepare bulk operations
      const body = [];
      operations.forEach((operation) => {
        if (operation.index) {
          // Validate index document
          try {
            this._validateDocument(operation.index);
          } catch (error) {
            throw new Error(`Invalid index document: ${error.message}`);
          }
          body.push({
            index: {
              _index: ElasticsearchController.INDEX_NAME,
              _id: operation.index.id, // Optional, will be auto-generated if not provided
            },
          });
          body.push({
            ...operation.index,
            created_at: new Date().toISOString(),
          });
        } else if (operation.update) {
          if (!operation.update.id) {
            throw new Error("Update operation requires an id");
          }
          body.push({
            update: {
              _index: ElasticsearchController.INDEX_NAME,
              _id: operation.update.id,
            },
          });
          body.push({
            doc: {
              ...operation.update.doc,
              updated_at: new Date().toISOString(),
            },
          });
        } else if (operation.delete) {
          if (!operation.delete.id) {
            throw new Error("Delete operation requires an id");
          }
          body.push({
            delete: {
              _index: ElasticsearchController.INDEX_NAME,
              _id: operation.delete.id,
            },
          });
        }
      });

      const result = await elasticClient.bulk({
        body,
        refresh: true, // Ensure changes are immediately visible
      });

      // Process results and collect any errors
      const processedResults = result.body.items.map((item, index) => {
        const operation = Object.keys(item)[0];
        return {
          operation,
          id: item[operation]._id,
          status: item[operation].status,
          success:
            item[operation].status >= 200 && item[operation].status < 300,
          error: item[operation].error?.reason,
          originalItem: operations[index],
        };
      });

      new OK({
        message: result.body.errors
          ? "Bulk operation completed with some errors"
          : "Bulk operation completed successfully",
        metadata: {
          took: result.body.took,
          items: processedResults,
          summary: {
            total: processedResults.length,
            successful: processedResults.filter((r) => r.success).length,
            failed: processedResults.filter((r) => !r.success).length,
          },
        },
      }).send(res);
    } catch (error) {
      this._handleError(res, error, "bulk operation");
    }
  };
}

module.exports = new ElasticsearchController();
