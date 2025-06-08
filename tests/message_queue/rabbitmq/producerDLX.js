// docker run -d --name rabbitMQ -p 5672:5672 -p 15672:15672 rabbitmq:3-management
// AMQP0-9-1

const amqp = require("amqplib");
const message = "Hello RabbitMQ!";

const runProducer = async () => {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationEx"; // Exchange for notifications, direct exchange type
    const notificationQueue = "notificationQueueProcess"; // Queue for processing notifications
    const deadLetterExchange = "deadLetterEx"; // Exchange for dead letter messages
    const deadLetterRoutingKey = "deadLetterRoutingKey"; // Routing key for dead letter messages
    const deadLetterQueue = "deadLetterQueue"; // Queue for dead letter messages

    // 1. Create notification exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });
    // 2. Create queue for processing notifications
    const queueResult = await channel.assertQueue(notificationQueue, {
      durable: true, // durable: true means the queue will survive a server restart
      exclusive: false, // exclusive: false means the queue can be used by other consumers
      autoDelete: false, // autoDelete: false means the queue will not be deleted when the last consumer unsubscribes
      deadLetterExchange: deadLetterExchange, // Set dead letter exchange
      deadLetterRoutingKey: deadLetterRoutingKey, // Set dead letter routing key
    });

    // 3. Bind the queue to the notification exchange
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. Send a message to the notification exchange
    const msg = "A new product is available!";
    console.log(`Sending message to exchange ${notificationExchange}:`, msg);
    await channel.sendToQueue(notificationQueue, Buffer.from(msg), {
      expiration: "5000", // Set message expiration to 5000 ms (5 seconds)
    });

    setTimeout(async () => {
      connection.close();
      console.log("Connection closed after 500 milliseconds");
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("Error in producer:", error);
  }
};

runProducer().catch(console.error);
