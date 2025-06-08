"use strict";

const amqp = require("amqplib");

async function consumerOrderedMessage() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const orderedQueue = "orderedQueue"; // Queue for ordered messages

  await channel.assertQueue(orderedQueue, {
    durable: true, // durable: true means the queue will survive a server restart
    exclusive: false, // exclusive: false means the queue can be used by other consumers
  });

  channel.prefetch(1); // Ensure that only one message is processed at a time

  channel.consume(orderedQueue, (msg) => {
    const message = msg.content.toString();

    // Simulate processing the message
    setTimeout(() => {
      console.log(`Processed message: ${message}`);
      // Acknowledge the message after processing
      channel.ack(msg);
    }, Math.random() * 1000); // Simulate processing time
  });
}

consumerOrderedMessage()
  .then(() => {
    console.log("Ordered messages sent successfully");
  })
  .catch((error) => {
    console.error("Error sending ordered messages:", error);
    process.exit(1);
  });
