"use strict";

const { consumerQueue, connectToRabbitMQ } = require("../dbs/init.rabbitmq");

const log = console.log;
console.log = function () {
  log.apply(console, [new Date().toJSON(), ...arguments]);
};

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

      // // 1. TTL (Time-To-Live) Error
      // setTimeout(() => {
      //   channel.consume(notificationQueue, (msg) => {
      //     // Wait for the delay using Promise
      //     console.log(
      //       `Received message from ${notificationQueue}:`,
      //       msg.content.toString()
      //     );
      //     // Acknowledge the message after processing
      //     channel.nack(msg);
      //   });
      // }, timeExpiration);

      // 2. Logic Error
      channel.consume(notificationQueue, (msg) => {
        const number = Math.random();
        console.log(
          `Processing message from ${notificationQueue} with random number: ${number}`
        );

        if (number < 0.5) {
          console.log(
            `Received message from ${notificationQueue}:`,
            msg.content.toString()
          );
          // Acknowledge the message after processing
          channel.ack(msg);
        } else {
          console.error(
            `Error processing message from ${notificationQueue}:`,
            msg.content.toString()
          );
          // Reject the message and send it to the dead letter queue
          // nack means "negative acknowledgment".
          // first false parameter is whether to requeue the message (false means it will not be requeued).
          // second false parameter indicates that the message should not be requeued, meaning it will be sent to the dead letter queue.
          channel.nack(msg, false, false);
        }
      });
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
        queueResult.queue,
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
        { noAck: true } // Set noAck to false to acknowledge messages after processing, true to not acknowledge
      );
    } catch (error) {
      console.error(`Error in consumerToQueueFailed for ${queue_name}:`, error);
      throw error;
    }
  },
};

module.exports = messageService;
