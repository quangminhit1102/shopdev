// backend/elastic-client.js
const { Client } = require("@elastic/elasticsearch");

require("dotenv").config({ path: ".elastic.env" });

const elasticClient = new Client({
  host: "localhost:9200",
  //   cloud: {
  //     id: process.env.ELASTIC_CLOUD_ID,
  //   },
  node: process.env.ELASTIC_NODE || "http://localhost:9200", // Adjust to your Elasticsearch URL
  // auth: {
  //   username: process.env.ELASTIC_USERNAME,
  //   password: process.env.ELASTIC_PASSWORD,
  // },
});

module.exports = elasticClient;
