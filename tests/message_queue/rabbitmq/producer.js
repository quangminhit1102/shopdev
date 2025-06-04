// docker run -d --name rabbitMQ -p 5672:5672 -p 15672:15672 rabbitmq:3-management
// AMQP0-9-1

const amqp = require("amqplib");
const message = "Hello RabbitMQ!";

const runProducer = async () => {
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

    // Send a message to the queue
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Sent message: ${message}`);


  } catch (error) {
    console.error("Error in producer:", error);
  }
};

runProducer().catch(console.error);
