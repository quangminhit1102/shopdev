"use strict";

const elasticClient = require("../dbs/elastic-client");
const { OK, CREATED } = require("./../core/success.response");

class ElasticsearchController {
  /**
   * Create a new post in Elasticsearch
   */
  createPost = async (req, res) => {
    const result = await elasticClient.index({
      index: "posts",
      body: {
        document: {
          title: req.body.title,
          author: req.body.author,
          content: req.body.content,
        },
      },
    });
    new CREATED({
      message: "Create successfully",
      metadata: result?.body || [],
    }).send(res);
  };

  /**
   * Remove a post from Elasticsearch
   */
  removePost = async (req, res) => {
    const result = await elasticClient.delete({
      index: "posts",
      id: req.params.id,
    });
    new OK({
      message: "Remove successfully",
      metadata: result?.body || [],
    }).send(res);
  };

  /**
   * Search posts
   */
  searchPosts = async (req, res) => {
    try {
      const result = await elasticClient.search({
        index: "posts",
        body: {
          query: {
            match: {
              title: req.query.search,
            },
          },
        },
      });

      new OK({
        message: "Search",
        metadata: result?.body?.hits?.hits || [],
      }).send(res);
    } catch (error) {
      console.error("Error searching posts:", error);
      // Handle error appropriately
    }
  };

  /**
   * Update a post in Elasticsearch
   */
  updatePost = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, content } = req.body;
      const result = await elasticClient.update({
        index: "posts",
        id,
        body: {
          doc: {
            ...(title && { title }),
            ...(author && { author }),
            ...(content && { content }),
          },
        },
      });
      new OK({
        message: "Update successfully",
        metadata: result?.body || [],
      }).send(res);
    } catch (error) {
      console.error("Error updating post:", error);
      res
        .status(500)
        .json({ message: "Error updating post", error: error.message });
    }
  };

  /**
   * Get all posts
   */
  getAllPosts = async (req, res) => {
    try {
      const result = await elasticClient.search({
        index: "posts",
        body: {
          query: {
            match_all: {},
          },
        },
      });

      new OK({
        message: "Search",
        metadata: result?.body?.hits?.hits || [],
      }).send(res);
    } catch (error) {
      console.error("Error searching posts:", error);
      // Handle error appropriately
    }
  };
}

module.exports = new ElasticsearchController();
