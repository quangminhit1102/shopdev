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

module.exports = {
  connectToRabbitMQ,
  connectToRabbitMQForTest,
};
