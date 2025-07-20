const elasticClient = require("./../dbs/elastic-client");

const createIndex = async (indexName) => {
  await elasticClient.indices.create({ index: indexName });
  console.log("Index created");
};

const deleteIndex = async (indexName) => {
  await elasticClient.indices.delete({ index: indexName });
  console.log("Index deleted");
};

const createMapping = async (indexName) => {
  await elasticClient.indices.putMapping({
    index: indexName,
    body: {
      properties: {
        title: { type: "text" },    // "text" type is full-text searchable
        content: { type: "text" },  // "text" type is full-text searchable
        author: { type: "keyword" }, // "keyword" for exact matches
      },
    },
  });
  console.log("Mapping created");
};

const recreateIndexWithMapping = async (indexName) => {
  try {
    await deleteIndex(indexName);
  } catch (err) {
    if (err?.meta?.body?.error?.type !== "index_not_found_exception") {
      throw err;
    }
    // Ignore if index does not exist
  }
  await createIndex(indexName);
  await createMapping(indexName);
  console.log("Index recreated with mapping");
};
recreateIndexWithMapping("posts").catch(console.error);
