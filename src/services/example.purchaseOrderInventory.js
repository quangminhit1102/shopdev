// example.purchaseOrderInventory.js
// Example: Using RedisPubSubExampleService for Purchase Order and Inventory Processing
// This demonstrates how a purchase order service can publish an event and an inventory service can subscribe and process it.

const RedisPubSubExampleService = require('./redis.pubsub.example.service');

// Simulate Purchase Order Service
async function purchaseOrderProcess() {
  const pubsub = new RedisPubSubExampleService();
  await pubsub.init();

  // Simulate creating a new order
  const orderEvent = {
    type: 'ORDER_CREATED',
    orderId: 'order123',
    userId: 'user456',
    items: [
      { productId: 'prodA', quantity: 2 },
      { productId: 'prodB', quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
  };

  // Publish the order event to the 'order_events' channel
  await pubsub.publish('order_events', JSON.stringify(orderEvent));
  console.log('Published order event:', orderEvent);
}

// Simulate Inventory Service
async function inventoryProcess() {
  const pubsub = new RedisPubSubExampleService();
  await pubsub.init();

  // Subscribe to the 'order_events' channel
  await pubsub.subscribe('order_events', (message) => {
    const event = JSON.parse(message);
    if (event.type === 'ORDER_CREATED') {
      // Process inventory for each item in the order
      event.items.forEach(item => {
        // Here you would decrement inventory in your DB
        console.log(`Decrement inventory for product ${item.productId} by ${item.quantity}`);
      });
    }
  });
  console.log('Inventory service is listening for order events...');
}

// To test, run inventoryProcess() in one process, and purchaseOrderProcess() in another (or sequentially).
// inventoryProcess();
// purchaseOrderProcess();

module.exports = { purchaseOrderProcess, inventoryProcess };
