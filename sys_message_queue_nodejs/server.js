"use strict";

const { consumerToQueue } = require("./services/consumerQueue.service");

const queueName = "test-topic";

consumerToQueue(queueName)
  .then(() => {
    console.log(`Consumer started for queue: ${queueName}`);
  })
  .catch((error) => {
    console.error(`Error starting consumer for queue ${queueName}:`, error);
    process.exit(1);
  });
