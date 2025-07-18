"use strict";

const elasticClient = require("../dbs/elastic-client");

class ElasticsearchController {
  /**
   * Redirect to homepage
   */
  home = async (req, res) => {
    res.redirect("http://localhost:3000/");
  };

  /**
   * Create a new post in Elasticsearch
   */
  createPost = async (req, res) => {
    const result = await elasticClient.index({
      index: "posts",
      document: {
        title: req.body.title,
        author: req.body.author,
        content: req.body.content,
      },
    });
    res.send(result);
  };

  /**
   * Remove a post from Elasticsearch
   */
  removePost = async (req, res) => {
    const result = await elasticClient.delete({
      index: "posts",
      id: req.query.id,
    });
    res.json(result);
  };

  /**
   * Search posts using fuzzy matching
   */
  searchPosts = async (req, res) => {
    const result = await elasticClient.search({
      index: "posts",
      query: { fuzzy: { title: req.query.query } },
    });
    res.json(result);
  };

  /**
   * Get all posts
   */
  getAllPosts = async (req, res) => {
    const result = await elasticClient.search({
      index: "posts",
      query: { match_all: {} },
    });
    res.send(result);
  };
}

module.exports = new ElasticsearchController();
