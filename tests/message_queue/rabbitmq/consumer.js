// docker run -d --name rabbitMQ -p 5672:5672 -p 15672:15672 rabbitmq:3-management
// AMQP0-9-1

const amqp = require("amqplib");
const message = "Hello RabbitMQ!";

const runConsumer = async () => {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Declare a queue named 'test-queue'
    const queue = "test-queue";
    await channel.assertQueue(
      queue,
      { durable: false } // Ensure the queue exists
    );

    // consume a message from the queue
    channel.consume(queue, (message) => {
      if (message !== null) {
        console.log(`Received message: ${message.content.toString()}`);
        // Acknowledge the message
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error("Error in producer:", error);
  }
};

runConsumer().catch(console.error);
