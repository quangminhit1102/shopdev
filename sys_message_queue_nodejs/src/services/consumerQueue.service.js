"use strict";

const { consumerQueue, connectToRabbitMQ } = require("../dbs/init.rabbitmq");

const messageService = {
  consumerToQueue: async (queue_name) => {
    try {
      const { channel } = await connectToRabbitMQ();
      await consumerQueue(channel, queue_name);
    } catch (error) {
      console.error(`Error in consumerToQueue for ${queue_name}:`, error);
      throw error;
    }
  },

  // Case processing
  consumerToQueueNormal: async (queue_name) => {
    try {
      const { channel } = await connectToRabbitMQ();
      const notificationQueue = "notificationQueueProcess"; // Queue for processing notifications

      const timeExpiration = 10000; // Set message expiration to 10000 ms (10 seconds)
      setTimeout(async () => {
        channel.consume(
          notificationQueue,
          async (msg) => {
            if (msg !== null) {
              console.log(
                `Received message from ${notificationQueue}:`,
                msg.content.toString()
              );
              channel.ack(msg);
            } else {
              console.log(`No messages in queue: ${notificationQueue}`);
            }
          },
          { noAck: false } // Set noAck to false to acknowledge messages after processing
        );
      }, timeExpiration);
    } catch (error) {
      console.error(`Error in consumerToQueueNormal for ${queue_name}:`, error);
      throw error;
    }
  },

  // Case processing failed
  consumerToQueueFailed: async (queue_name) => {
    try {
      const { channel } = await connectToRabbitMQ();
      const deadLetterExchange = "deadLetterEx"; // Exchange for dead letter messages
      const deadLetterRoutingKey = "deadLetterRoutingKey"; // Routing key for dead letter messages
      const deadLetterQueue = "deadLetterQueue"; // Queue for dead letter messages

      // Declare the dead letter exchange
      await channel.assertExchange(deadLetterExchange, "direct", {
        durable: true,
      });

      // Declare the dead letter queue
      const queueResult = await channel.assertQueue(deadLetterQueue, {
        exclusive: false, // exclusive: false means the queue can be used by other consumers
      });

      // Bind the dead letter queue to the dead letter exchange
      await channel.bindQueue(
        queueResult.queue,
        deadLetterExchange,
        deadLetterRoutingKey
      );

      await channel.consume(
        deadLetterQueue,
        async (msg) => {
          if (msg !== null) {
            console.log(
              `[Hot fix] Received message from ${deadLetterQueue}:`,
              msg.content.toString()
            );
          } else {
            console.log(`No messages in queue: ${deadLetterQueue}`);
          }
        },
        { noAck: true } // Set noAck to false to acknowledge messages after processing
      );
    } catch (error) {
      console.error(`Error in consumerToQueueFailed for ${queue_name}:`, error);
      throw error;
    }
  },
};

module.exports = messageService;
