"use strict";

const {
  consumerToQueue,
  consumerToQueueFailed,
  consumerToQueueNormal,
} = require("./src/services/consumerQueue.service");

// const queueName = "test-topic";
// consumerToQueue(queueName)
//   .then(() => {
//     console.log(`Consumer started for queue: ${queueName}`);
//   })
//   .catch((error) => {
//     console.error(`Error starting consumer for queue ${queueName}:`, error);
//     process.exit(1);
//   });

consumerToQueueNormal("notificationQueueProcess")
  .then(() => {
    console.log("Consumer started for consumerToQueueNormal");
  })
  .catch((error) => {
    console.error("Error starting consumer for consumerToQueueNormal:", error);
    process.exit(1);
  });

consumerToQueueFailed("deadLetterQueue")
  .then(() => {
    console.log("Consumer started for consumerToQueueFailed");
  })
  .catch((error) => {
    console.error("Error starting consumer for consumerToQueueFailed:", error);
    process.exit(1);
  });
