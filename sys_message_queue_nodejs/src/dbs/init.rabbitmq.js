"use strict";

const amqp = require("amqplib");
const connectToRabbitMQ = async () => {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};

const connectToRabbitMQForTest = async () => {
  try {
    // Connect to RabbitMQ server for testing
    const { connection, channel } = await connectToRabbitMQ();

    // publish a test message to a queue
    const queue = "test-queue";
    const message = "Hello RabbitMQ for test!";
    await channel.assertQueue(queue, { durable: false }); // Ensure the queue exists; durable: false means the queue will not survive a server restart
    await channel.sendToQueue(queue, Buffer.from(message));

    // Close connection and channel after sending the message
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error connecting to RabbitMQ for test:", error);
    throw error;
  }
};

const consumerQueue = async (channel, queue_name) => {
  try {
    // Ensure the queue exists
    await channel.assertQueue(queue_name, { durable: true }); //Durable: false means the queue will not survive a server restart, true means it will
    console.log(`Waiting for messages in queue: ${queue_name}`);

    channel.consume(
      queue_name,
      (msg) => {
        if (msg !== null) {
          console.log(
            `Received message from ${queue_name}:`,
            msg.content.toString()
            // 1. Find user following SHOP
            // 2. Send notification to user
            // 3. Send ok => return 200 OK else return 500 Internal Server Error
            // 4. If error, set up DLX (Dead Letter Exchange) to handle failed messages
          );
        } else {
          console.log(`No messages in queue: ${queue_name}`);
        }
      },
      { noAck: true }
    ); // noAck: false means we will acknowledge the message after processing, true means we will not acknowledge the message
  } catch (error) {
    console.error(`Error consuming from queue ${queue_name}:`, error);
    throw error;
  }
};

module.exports = {
  connectToRabbitMQ,
  connectToRabbitMQForTest,
  consumerQueue,
};
