# Apache Kafka Essential Guide

## What is Kafka?
Apache Kafka is a distributed event streaming platform used for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.

## Core Concepts

### 1. **Topics**
- Logical channels for organizing messages
- Similar to database tables or folders
- Messages are appended to topics

### 2. **Partitions**
- Topics are split into partitions for scalability
- Each partition is an ordered, immutable sequence
- Enables parallel processing

### 3. **Producers**
- Applications that publish messages to topics
- Can choose which partition to send messages

### 4. **Consumers**
- Applications that read messages from topics
- Track their position (offset) in each partition

### 5. **Consumer Groups**
- Set of consumers working together
- Each partition consumed by only one consumer in group
- Enables load balancing

### 6. **Brokers**
- Kafka servers that store data
- Handle all requests from clients
- Replicate data for fault tolerance

### 7. **Zookeeper/KRaft**
- Manages cluster metadata
- Handles leader election
- KRaft mode (newer) eliminates Zookeeper dependency

## Key Features

- **High Throughput**: Handles millions of messages per second
- **Scalability**: Easily scale horizontally
- **Durability**: Messages persisted to disk
- **Fault Tolerance**: Replication across brokers
- **Low Latency**: Real-time message processing
- **Ordering Guarantee**: Within partitions

## Common Use Cases

1. **Real-time Analytics**: Process streams of data in real-time
2. **Log Aggregation**: Collect logs from multiple services
3. **Event Sourcing**: Store state changes as events
4. **Message Queue**: Decouple microservices
5. **Activity Tracking**: Track user behavior
6. **Metrics Collection**: Gather system metrics

## Installation & Setup

### Using Docker
```bash
# Start Zookeeper
docker run -d --name zookeeper -p 2181:2181 zookeeper:latest

# Start Kafka
docker run -d --name kafka -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  confluentinc/cp-kafka:latest
```

### Using Docker Compose
```yaml
version: '3'
services:
  zookeeper:
    image: zookeeper:latest
    ports:
      - "2181:2181"
  
  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

## Code Examples

### Node.js Express

#### Install Dependencies
```bash
npm install kafkajs express body-parser
```

#### Producer with Express API
```javascript
const express = require('express');
const { Kafka } = require('kafkajs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// Initialize producer
const initProducer = async () => {
  await producer.connect();
};

// API endpoint to send messages
app.post('/send', async (req, res) => {
  try {
    const { topic, message } = req.body;
    
    await producer.send({
      topic: topic || 'my-topic',
      messages: [
        { 
          key: 'key1',
          value: JSON.stringify(message),
          partition: 0 
        }
      ]
    });
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(3000, async () => {
  await initProducer();
  console.log('Server running on port 3000');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await producer.disconnect();
  process.exit(0);
});
```

#### Consumer Service
```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-consumer-app',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'my-group' });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value.toString(),
        headers: message.headers
      });
      
      // Process message here
      const data = JSON.parse(message.value.toString());
      console.log('Received:', data);
    }
  });
};

runConsumer().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await consumer.disconnect();
  process.exit(0);
});
```

### C# (.NET)

#### Install NuGet Package
```bash
dotnet add package Confluent.Kafka
```

#### Producer Example
```csharp
using System;
using System.Threading.Tasks;
using Confluent.Kafka;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace KafkaExample
{
    public class KafkaProducerService
    {
        private readonly IProducer<string, string> _producer;
        
        public KafkaProducerService(IConfiguration config)
        {
            var producerConfig = new ProducerConfig
            {
                BootstrapServers = "localhost:9092",
                ClientId = "my-app",
                Acks = Acks.All,
                EnableIdempotence = true,
                MaxInFlight = 5,
                CompressionType = CompressionType.Snappy,
                LingerMs = 10,
                BatchSize = 16384
            };
            
            _producer = new ProducerBuilder<string, string>(producerConfig).Build();
        }
        
        public async Task<DeliveryResult<string, string>> SendMessageAsync(string topic, object message)
        {
            try
            {
                var kafkaMessage = new Message<string, string>
                {
                    Key = Guid.NewGuid().ToString(),
                    Value = JsonConvert.SerializeObject(message),
                    Headers = new Headers { { "correlation-id", Guid.NewGuid().ToByteArray() } }
                };
                
                var result = await _producer.ProduceAsync(topic, kafkaMessage);
                
                Console.WriteLine($"Delivered to: {result.TopicPartitionOffset}");
                return result;
            }
            catch (ProduceException<string, string> ex)
            {
                Console.WriteLine($"Delivery failed: {ex.Error.Reason}");
                throw;
            }
        }
        
        public void Dispose()
        {
            _producer?.Dispose();
        }
    }
    
    // ASP.NET Core Controller
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly KafkaProducerService _kafkaService;
        
        public MessageController(KafkaProducerService kafkaService)
        {
            _kafkaService = kafkaService;
        }
        
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto message)
        {
            var result = await _kafkaService.SendMessageAsync("my-topic", message);
            return Ok(new { success = true, offset = result.Offset.Value });
        }
    }
    
    public class MessageDto
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public string Message { get; set; }
    }
}
```

#### Consumer Example
```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using Confluent.Kafka;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace KafkaExample
{
    public class KafkaConsumerService : BackgroundService
    {
        private readonly ILogger<KafkaConsumerService> _logger;
        private readonly IConsumer<string, string> _consumer;
        
        public KafkaConsumerService(ILogger<KafkaConsumerService> logger)
        {
            _logger = logger;
            
            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = "localhost:9092",
                GroupId = "my-consumer-group",
                ClientId = "my-consumer",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false,
                EnableAutoOffsetStore = false,
                MaxPollIntervalMs = 300000,
                SessionTimeoutMs = 10000
            };
            
            _consumer = new ConsumerBuilder<string, string>(consumerConfig)
                .SetErrorHandler((_, e) => _logger.LogError($"Error: {e.Reason}"))
                .SetPartitionsAssignedHandler((c, partitions) =>
                {
                    _logger.LogInformation($"Assigned partitions: [{string.Join(", ", partitions)}]");
                })
                .SetPartitionsRevokedHandler((c, partitions) =>
                {
                    _logger.LogInformation($"Revoked partitions: [{string.Join(", ", partitions)}]");
                })
                .Build();
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _consumer.Subscribe("my-topic");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = _consumer.Consume(stoppingToken);
                    
                    if (consumeResult != null)
                    {
                        var message = JsonConvert.DeserializeObject<dynamic>(consumeResult.Message.Value);
                        
                        _logger.LogInformation($"Received message at {consumeResult.TopicPartitionOffset}: {message}");
                        
                        // Process message
                        await ProcessMessageAsync(message);
                        
                        // Commit offset after successful processing
                        _consumer.Commit(consumeResult);
                    }
                }
                catch (ConsumeException e)
                {
                    _logger.LogError($"Consume error: {e.Error.Reason}");
                }
                catch (Exception e)
                {
                    _logger.LogError($"Unexpected error: {e.Message}");
                }
            }
        }
        
        private async Task ProcessMessageAsync(dynamic message)
        {
            // Add your message processing logic here
            await Task.Delay(100); // Simulate processing
        }
        
        public override void Dispose()
        {
            _consumer?.Close();
            _consumer?.Dispose();
            base.Dispose();
        }
    }
}
```

### Golang

#### Install Dependencies
```bash
go get github.com/confluentinc/confluent-kafka-go/v2/kafka
go get github.com/gin-gonic/gin
```

#### Producer with Gin API
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/confluentinc/confluent-kafka-go/v2/kafka"
    "github.com/gin-gonic/gin"
)

type Message struct {
    Name    string `json:"name"`
    Age     int    `json:"age"`
    Message string `json:"message"`
}

type KafkaProducer struct {
    producer *kafka.Producer
}

func NewKafkaProducer() (*KafkaProducer, error) {
    config := &kafka.ConfigMap{
        "bootstrap.servers": "localhost:9092",
        "client.id":        "go-producer",
        "acks":            "all",
        "compression.type": "snappy",
        "linger.ms":       10,
        "batch.size":      16384,
    }
    
    producer, err := kafka.NewProducer(config)
    if err != nil {
        return nil, err
    }
    
    // Handle delivery reports
    go func() {
        for e := range producer.Events() {
            switch ev := e.(type) {
            case *kafka.Message:
                if ev.TopicPartition.Error != nil {
                    log.Printf("Delivery failed: %v\n", ev.TopicPartition.Error)
                } else {
                    log.Printf("Delivered to %v\n", ev.TopicPartition)
                }
            }
        }
    }()
    
    return &KafkaProducer{producer: producer}, nil
}

func (kp *KafkaProducer) SendMessage(topic string, message interface{}) error {
    data, err := json.Marshal(message)
    if err != nil {
        return err
    }
    
    kafkaMsg := &kafka.Message{
        TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
        Key:            []byte("key1"),
        Value:          data,
        Headers: []kafka.Header{
            {Key: "correlation-id", Value: []byte("123")},
        },
    }
    
    return kp.producer.Produce(kafkaMsg, nil)
}

func (kp *KafkaProducer) Close() {
    kp.producer.Flush(15 * 1000)
    kp.producer.Close()
}

func main() {
    // Initialize Kafka producer
    kafkaProducer, err := NewKafkaProducer()
    if err != nil {
        log.Fatal("Failed to create producer:", err)
    }
    defer kafkaProducer.Close()
    
    // Setup Gin router
    router := gin.Default()
    
    router.POST("/send", func(c *gin.Context) {
        var msg Message
        if err := c.ShouldBindJSON(&msg); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        
        if err := kafkaProducer.SendMessage("my-topic", msg); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "Message sent"})
    })
    
    router.Run(":8080")
}
```

#### Consumer Example
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "os"
    "os/signal"
    "syscall"
    
    "github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

type Message struct {
    Name    string `json:"name"`
    Age     int    `json:"age"`
    Message string `json:"message"`
}

type KafkaConsumer struct {
    consumer *kafka.Consumer
}

func NewKafkaConsumer() (*KafkaConsumer, error) {
    config := &kafka.ConfigMap{
        "bootstrap.servers":  "localhost:9092",
        "group.id":          "go-consumer-group",
        "client.id":         "go-consumer",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": false,
        "session.timeout.ms": 10000,
        "max.poll.interval.ms": 300000,
    }
    
    consumer, err := kafka.NewConsumer(config)
    if err != nil {
        return nil, err
    }
    
    return &KafkaConsumer{consumer: consumer}, nil
}

func (kc *KafkaConsumer) Subscribe(topics []string) error {
    return kc.consumer.SubscribeTopics(topics, nil)
}

func (kc *KafkaConsumer) ProcessMessages() {
    sigchan := make(chan os.Signal, 1)
    signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)
    
    run := true
    for run {
        select {
        case sig := <-sigchan:
            fmt.Printf("Caught signal %v: terminating\n", sig)
            run = false
        default:
            msg, err := kc.consumer.ReadMessage(-1)
            if err == nil {
                var message Message
                if err := json.Unmarshal(msg.Value, &message); err != nil {
                    log.Printf("Error unmarshaling message: %v", err)
                    continue
                }
                
                fmt.Printf("Message on %s[%d]@%d: %+v\n",
                    *msg.TopicPartition.Topic,
                    msg.TopicPartition.Partition,
                    msg.TopicPartition.Offset,
                    message)
                
                // Process message
                processMessage(message)
                
                // Commit offset after successful processing
                _, err := kc.consumer.CommitMessage(msg)
                if err != nil {
                    log.Printf("Error committing: %v", err)
                }
            } else {
                log.Printf("Consumer error: %v\n", err)
            }
        }
    }
}

func processMessage(msg Message) {
    // Add your message processing logic here
    fmt.Printf("Processing: Name=%s, Age=%d, Message=%s\n", msg.Name, msg.Age, msg.Message)
}

func (kc *KafkaConsumer) Close() {
    kc.consumer.Close()
}

func main() {
    consumer, err := NewKafkaConsumer()
    if err != nil {
        log.Fatal("Failed to create consumer:", err)
    }
    defer consumer.Close()
    
    topics := []string{"my-topic"}
    if err := consumer.Subscribe(topics); err != nil {
        log.Fatal("Failed to subscribe:", err)
    }
    
    fmt.Println("Consumer started. Press Ctrl+C to stop.")
    consumer.ProcessMessages()
}

## CLI Commands

### Topic Management
```bash
# Create topic
kafka-topics --create --topic my-topic --partitions 3 --replication-factor 1 \
  --bootstrap-server localhost:9092

# List topics
kafka-topics --list --bootstrap-server localhost:9092

# Describe topic
kafka-topics --describe --topic my-topic --bootstrap-server localhost:9092

# Delete topic
kafka-topics --delete --topic my-topic --bootstrap-server localhost:9092
```

### Producer/Consumer CLI
```bash
# Console producer
kafka-console-producer --topic my-topic --bootstrap-server localhost:9092

# Console consumer
kafka-console-consumer --topic my-topic --from-beginning \
  --bootstrap-server localhost:9092

# Consumer with group
kafka-console-consumer --topic my-topic --group my-group \
  --bootstrap-server localhost:9092
```

### Consumer Group Management
```bash
# List consumer groups
kafka-consumer-groups --list --bootstrap-server localhost:9092

# Describe group
kafka-consumer-groups --describe --group my-group \
  --bootstrap-server localhost:9092

# Reset offset
kafka-consumer-groups --reset-offsets --group my-group \
  --topic my-topic --to-earliest --execute \
  --bootstrap-server localhost:9092
```

## Configuration

### Important Producer Configs
```properties
# Acknowledgment level
acks=all  # Wait for all replicas

# Retries
retries=3

# Batch size
batch.size=16384

# Compression
compression.type=snappy

# Idempotence (exactly-once)
enable.idempotence=true
```

### Important Consumer Configs
```properties
# Auto commit
enable.auto.commit=true
auto.commit.interval.ms=5000

# Session timeout
session.timeout.ms=10000

# Max poll records
max.poll.records=500

# Offset reset
auto.offset.reset=earliest
```

### Important Broker Configs
```properties
# Log retention
log.retention.hours=168
log.retention.bytes=1073741824

# Replication
default.replication.factor=3
min.insync.replicas=2

# Network
num.network.threads=8
num.io.threads=8
```

## Best Practices

### 1. **Partitioning Strategy**
- Use consistent hashing for key-based partitioning
- Consider data skew when choosing partition keys
- More partitions = better parallelism

### 2. **Replication**
- Set replication factor ≥ 3 for production
- Use `min.insync.replicas` for durability
- Monitor under-replicated partitions

### 3. **Producer Optimization**
- Use batching for throughput
- Enable compression
- Use async sends with callbacks
- Configure appropriate retries

### 4. **Consumer Optimization**
- Use consumer groups for scalability
- Commit offsets after processing
- Handle rebalancing gracefully
- Monitor consumer lag

### 5. **Monitoring**
- Track consumer lag
- Monitor broker disk usage
- Watch partition distribution
- Set up alerts for failures

## Kafka Streams Example

```java
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;

public class WordCount {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "wordcount-app");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        
        StreamsBuilder builder = new StreamsBuilder();
        
        KStream<String, String> textLines = builder.stream("input-topic");
        
        KTable<String, Long> wordCounts = textLines
            .flatMapValues(line -> Arrays.asList(line.split("\\W+")))
            .groupBy((key, word) -> word)
            .count();
        
        wordCounts.toStream().to("output-topic");
        
        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();
    }
}
```

## Schema Registry Integration

```java
// Avro Producer with Schema Registry
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("schema.registry.url", "http://localhost:8081");

Producer<String, GenericRecord> producer = new KafkaProducer<>(props);
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Kafka is running
   - Verify port configuration
   - Check firewall settings

2. **Consumer Lag**
   - Add more consumers
   - Increase partition count
   - Optimize processing logic

3. **Out of Memory**
   - Adjust JVM heap size
   - Configure batch sizes
   - Check retention policies

4. **Rebalancing Issues**
   - Tune session timeout
   - Check heartbeat interval
   - Monitor network stability

## Performance Tuning

### Producer Performance
- Increase `batch.size` and `linger.ms`
- Use compression
- Adjust `buffer.memory`
- Use async sends

### Consumer Performance
- Increase `fetch.min.bytes`
- Adjust `max.poll.records`
- Use multiple consumer threads
- Optimize deserialization

### Broker Performance
- Increase `num.io.threads`
- Optimize disk I/O
- Use SSD storage
- Configure OS page cache

## Security

### SSL/TLS Configuration
```properties
# Broker config
listeners=SSL://localhost:9093
ssl.keystore.location=/path/to/keystore
ssl.keystore.password=password
ssl.key.password=password

# Client config
security.protocol=SSL
ssl.truststore.location=/path/to/truststore
ssl.truststore.password=password
```

### SASL Authentication
```properties
# SASL/PLAIN
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
  username="user" password="password";
```

## Quick Reference

| Component | Default Port | Purpose |
|-----------|-------------|---------|
| Broker | 9092 | Client connections |
| Zookeeper | 2181 | Cluster coordination |
| Schema Registry | 8081 | Schema management |
| REST Proxy | 8082 | HTTP API |
| Connect | 8083 | Integration framework |

## Useful Resources

- [Official Documentation](https://kafka.apache.org/documentation/)
- [Confluent Platform](https://www.confluent.io/product/confluent-platform/)
- [Kafka Streams](https://kafka.apache.org/documentation/streams/)
- [KSQL](https://ksqldb.io/)
- [Kafka Connect](https://kafka.apache.org/documentation/#connect)