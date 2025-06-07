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
};

module.exports = messageService;
