# Socket.io Real-time Notifications with Express.js

## Installation

```bash
npm install socket.io express
```

## Basic Server Setup

```javascript
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Core Socket Events

### Connection Handling

```javascript
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send welcome message
  socket.emit("welcome", "Welcome to the server!");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
```

### Basic Notification System

```javascript
// Send notification to specific user
socket.on("send_notification", (data) => {
  socket.to(data.userId).emit("notification", {
    message: data.message,
    type: data.type,
    timestamp: new Date(),
  });
});

// Broadcast to all users except sender
socket.broadcast.emit("global_notification", {
  message: "New user joined!",
  type: "info",
});

// Send to all users (including sender)
io.emit("server_announcement", {
  message: "Server maintenance in 5 minutes",
  type: "warning",
});
```

## Room-Based Notifications

```javascript
// Join user to room
socket.on("join_room", (roomName) => {
  socket.join(roomName);
  socket.to(roomName).emit("notification", {
    message: `User ${socket.id} joined ${roomName}`,
    type: "info",
  });
});

// Send notification to room
socket.on("room_message", (data) => {
  io.to(data.room).emit("room_notification", {
    message: data.message,
    sender: socket.id,
    room: data.room,
    timestamp: new Date(),
  });
});

// Leave room
socket.on("leave_room", (roomName) => {
  socket.leave(roomName);
});
```

## Advanced Features

### User Authentication & Tracking

```javascript
const connectedUsers = new Map();

io.on("connection", (socket) => {
  // User authentication
  socket.on("authenticate", (userData) => {
    socket.userId = userData.userId;
    socket.username = userData.username;
    connectedUsers.set(userData.userId, socket.id);

    // Notify others of new user
    socket.broadcast.emit("user_online", {
      userId: userData.userId,
      username: userData.username,
    });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      socket.broadcast.emit("user_offline", {
        userId: socket.userId,
        username: socket.username,
      });
    }
  });
});

// Send notification to specific user by userId
function sendNotificationToUser(userId, notification) {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("notification", notification);
  }
}
```

### Message Queue for Offline Users

```javascript
const offlineMessages = new Map();

function sendNotification(userId, notification) {
  const socketId = connectedUsers.get(userId);

  if (socketId) {
    // User is online, send immediately
    io.to(socketId).emit("notification", notification);
  } else {
    // User is offline, queue message
    if (!offlineMessages.has(userId)) {
      offlineMessages.set(userId, []);
    }
    offlineMessages.get(userId).push(notification);
  }
}

// Send queued messages when user connects
socket.on("authenticate", (userData) => {
  socket.userId = userData.userId;
  connectedUsers.set(userData.userId, socket.id);

  // Send queued offline messages
  const queuedMessages = offlineMessages.get(userData.userId) || [];
  queuedMessages.forEach((message) => {
    socket.emit("notification", message);
  });
  offlineMessages.delete(userData.userId);
});
```

## Client-Side Implementation

### Basic HTML Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.io Notifications</title>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <div id="notifications"></div>
    <script>
      const socket = io();

      // Listen for notifications
      socket.on("notification", (data) => {
        showNotification(data);
      });

      function showNotification(data) {
        const notificationDiv = document.createElement("div");
        notificationDiv.className = `notification ${data.type}`;
        notificationDiv.innerHTML = `
                <strong>${data.type.toUpperCase()}</strong>
                <p>${data.message}</p>
                <small>${new Date(data.timestamp).toLocaleTimeString()}</small>
            `;
        document.getElementById("notifications").appendChild(notificationDiv);
      }

      // Authenticate user
      socket.emit("authenticate", {
        userId: "user123",
        username: "JohnDoe",
      });
    </script>
  </body>
</html>
```

### React Client Example

```javascript
import { useEffect, useState } from "react";
import io from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    // Listen for notifications
    newSocket.on("notification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    // Authenticate
    newSocket.emit("authenticate", {
      userId: "user123",
      username: "JohnDoe",
    });

    return () => newSocket.close();
  }, []);

  return (
    <div>
      {notifications.map((notification, index) => (
        <div key={index} className={`notification ${notification.type}`}>
          <strong>{notification.type.toUpperCase()}</strong>
          <p>{notification.message}</p>
          <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
  );
}
```

## Common Notification Types

```javascript
const NotificationTypes = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  MESSAGE: "message",
  SYSTEM: "system",
};

// Usage examples
function sendSystemNotification(message) {
  io.emit("notification", {
    message,
    type: NotificationTypes.SYSTEM,
    timestamp: new Date(),
  });
}

function sendUserMessage(fromUserId, toUserId, message) {
  const socketId = connectedUsers.get(toUserId);
  if (socketId) {
    io.to(socketId).emit("notification", {
      message,
      type: NotificationTypes.MESSAGE,
      from: fromUserId,
      timestamp: new Date(),
    });
  }
}
```

## Best Practices

### 1. Error Handling

```javascript
socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Server-side error handling
socket.on("some_event", (data) => {
  try {
    // Process data
  } catch (error) {
    socket.emit("error", { message: "Processing failed" });
  }
});
```

### 2. Rate Limiting

```javascript
const rateLimit = new Map();

socket.on("send_message", (data) => {
  const now = Date.now();
  const userRateLimit = rateLimit.get(socket.userId) || {
    count: 0,
    resetTime: now + 60000,
  };

  if (now > userRateLimit.resetTime) {
    userRateLimit.count = 0;
    userRateLimit.resetTime = now + 60000;
  }

  if (userRateLimit.count >= 10) {
    socket.emit("error", { message: "Rate limit exceeded" });
    return;
  }

  userRateLimit.count++;
  rateLimit.set(socket.userId, userRateLimit);

  // Process message
});
```

### 3. Connection Management

```javascript
// Heartbeat to check connection
setInterval(() => {
  socket.emit("ping");
}, 30000);

socket.on("pong", () => {
  // Connection is alive
});

// Auto-reconnect on client
socket.on("disconnect", () => {
  console.log("Disconnected, attempting to reconnect...");
});

socket.on("connect", () => {
  console.log("Reconnected successfully");
});
```

## Environment Configuration

```javascript
// config.js
module.exports = {
  development: {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  },
  production: {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  },
};

// Use in server
const config = require("./config")[process.env.NODE_ENV || "development"];
const io = new Server(server, config);
```

## Deployment Notes

- Use Redis adapter for multiple server instances
- Configure proper CORS for production
- Implement proper authentication and authorization
- Monitor connection counts and performance
- Use clustering for high-traffic applications

```javascript
// Redis adapter for scaling
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```
