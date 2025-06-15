# ShopDev E-commerce Platform

A robust, scalable e-commerce backend built with Node.js, Express, and MongoDB, featuring real-time notifications, advanced caching, and message queuing.

[![Node.js Version](https://img.shields.io/badge/node-v18+-blue.svg)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/express-v4.21-blue.svg)](https://expressjs.com)
[![MongoDB Version](https://img.shields.io/badge/mongodb-v5+-green.svg)](https://www.mongodb.com)

## 🚀 Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.21
- **Database:** MongoDB 5+
- **Caching:** Redis 5+
- **Message Queue:** RabbitMQ, Kafka
- **File Storage:** Cloudinary
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest, Supertest
- **Security:** JWT, API Keys, Helmet

## ✨ Features

### Core Features
- 🛍️ **Product Management**
  - CRUD operations
  - Search and filtering
  - Product types (Electronics, Clothing, etc.)
  - Image upload via Cloudinary

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - API key validation
  - Role-based access control
  - Dynamic API permissions

- 🛒 **Shopping Experience**
  - Cart management
  - Order processing
  - Checkout system
  - Inventory tracking

### Advanced Features
- 💰 **Discount System**
  - Discount codes
  - Multiple discount types
  - Usage tracking
  - GraphQL API support

- 📝 **Comments & Reviews**
  - Nested comments (Nested Set Model)
  - Product reviews
  - Rating system

- 📨 **Notifications**
  - Real-time notifications
  - Multiple notification types
  - Redis Pub/Sub

- 🔄 **Distributed Systems**
  - Message queuing (RabbitMQ/Kafka)
  - Distributed locking
  - Master-Slave architecture support

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shopdev.git
   cd shopdev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Configure the following in your .env:
   ```
   PORT=3055
   MONGODB_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   ```

4. **Start the server**
   ```bash
   # Development
   npm start

   # Kill running instance on port
   npm run kill
   ```

## 📁 Project Structure

```
src/
├── app.js                # Express app setup
├── configs/              # Configuration files
├── controllers/          # Route controllers
├── core/                # Core response classes
├── dbs/                 # Database initialization
├── helpers/             # Utility helpers
├── middlewares/         # Express middlewares
├── models/              # Mongoose models
│   └── repositories/    # Data access layer
├── routers/             # API routes
├── services/            # Business logic
└── utils/               # Utility functions
```

## 🔑 API Overview

### Base URL: `/shopdev`

#### Authentication
- `POST /access/signup` - Register new shop/user
- `POST /access/login` - Login user
- `POST /access/logout` - Logout user

#### Products
- `GET /product` - List products
- `POST /product` - Create product
- `GET /product/:id` - Get product
- `PUT /product/:id` - Update product
- `DELETE /product/:id` - Delete product

#### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details

#### Notifications
- `GET /notification` - Get user notifications

See `/api-docs` for complete Swagger documentation.

## 📚 Documentation

Detailed documentation available in `docs/`:
- [Design Patterns](docs/DesignPattern.md)
- [Database Architecture](docs/DatabaseRevision.md)
- [Distributed Locks](docs/Distributed-Locks-Nodejs.md)
- [MySQL Indexing](docs/MySQL-index.md)
- [Redis Caching](docs/Redis.md)
- [Message Queues](docs/RabbitMQ.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run specific test suite
npm test -- tests/services
```

## 🔒 Security Features

- HTTP Security Headers (Helmet)
- CORS Protection
- Rate Limiting
- API Key Authentication
- JWT Token Validation
- Request Validation (Joi)
- SQL Injection Prevention
- XSS Protection

## 🚦 Error Handling

Centralized error handling with custom error classes:
- BadRequestError
- NotFoundError
- AuthenticationError
- ValidationError

## 💡 Best Practices

- RESTful API design
- MVC Architecture
- Repository Pattern
- Strategy Pattern
- Factory Pattern
- Centralized Response Handling
- Asynchronous Error Handling
- Database Indexing
- Caching Strategies

## 📈 Performance Optimizations

- Response Compression
- MongoDB Indexing
- Redis Caching
- Connection Pooling
- Graceful Shutdown
- Load Balancing Support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

[ISC License](LICENSE)

## 👥 Authors

- [Your Name] - Initial work

For questions or feedback, please open an issue or contact [your@email.com]
