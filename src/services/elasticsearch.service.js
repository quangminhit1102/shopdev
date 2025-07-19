const elasticClient = require("./../dbs/elastic-client");

const createIndex = async (indexName) => {
  await elasticClient.indices.create({ index: indexName });
  console.log("Index created");
};

const deleteIndex = async (indexName) => {
  await elasticClient.indices.delete({ index: indexName });
  console.log("Index deleted");
};

deleteIndex("posts");
createIndex("posts");
