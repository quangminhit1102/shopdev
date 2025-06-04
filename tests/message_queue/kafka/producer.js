const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  ssl: true,
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const runProducer = async () => {
  await producer.connect();
  // Example message to send
  const message = {
    value: "Hello Kafka!",
  };

  // Send a message to the topic
  await producer.send({
    topic: "test-topic",
    messages: [message],
  });
};

runProducer()
  .then(() => console.log("Message sent successfully"))
  .catch((error) => console.error("Error sending message:", error))
  .finally(() => producer.disconnect());
