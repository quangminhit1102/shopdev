"use strict";

const { connectToRabbitMQForTest } = require("../databases/init.rabbitmq");

describe("RabbitMQ Connection", () => {
  it("should connect to RabbitMQ and send a test message", async () => {
    const result = await connectToRabbitMQForTest();
    expect(result).toBeUndefined();
  });
});
