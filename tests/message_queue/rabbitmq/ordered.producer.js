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

  for (let i = 0; i < 10; i++) {
    const msg = `Ordered message ${i + 1}`;
    console.log(`Sending message to queue ${orderedQueue}:`, msg);
    await channel.sendToQueue(orderedQueue, Buffer.from(msg), {
      persistent: true, // persistent: true means the message will be saved to disk
    });
  }
  setTimeout(async () => {
    await channel.close();
    await connection.close();
    console.log("Connection closed after 500 milliseconds");
    process.exit(0);
  }, 500);
}

consumerOrderedMessage()
  .then(() => {
    console.log("Ordered messages sent successfully");
  })
  .catch((error) => {
    console.error("Error sending ordered messages:", error);
    process.exit(1);
  });
