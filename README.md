# ShopDev Monorepo

A robust, scalable e-commerce platform with a Node.js/Express/MongoDB backend and a modern React (Vite + Tailwind) frontend. Features real-time notifications, advanced caching, message queuing, and more.

[![Node.js Version](https://img.shields.io/badge/node-v18+-blue.svg)](https://nodejs.org)
[![Express Version](https://img.shields.io/badge/express-v4.21-blue.svg)](https://expressjs.com)
[![MongoDB Version](https://img.shields.io/badge/mongodb-v5+-green.svg)](https://www.mongodb.com)

## 🚀 Tech Stack

**Backend:**

- Node.js v18+, Express.js 4.21
- MongoDB 5+, Redis 5+
- RabbitMQ, Kafka (Message Queue)
- Cloudinary (File Storage)
- Swagger/OpenAPI (API Docs)
- Jest, Supertest (Testing)
- JWT, API Keys, Helmet (Security)

**Frontend:**

- React (Vite)
- Tailwind CSS

## 🛠️ Monorepo Structure

```
ShopDev/
├── src/                 # Backend source code
├── Shopdev-web-react-vite/  # Frontend (React + Vite)
├── docs/                # Documentation
├── tests/               # Test suites
├── server.js            # Backend entry point
└── ...
```

## �️ Installation & Usage

### 1. Clone the repository

```bash
git clone https://github.com/quangminhit1102/shopdev.git
cd ShopDev
```

### 2. Backend Setup

```bash
cd ShopDev # if not already in root
npm install
cp .env.example .env
# Edit .env with your credentials
```

Example .env:

```
PORT=3055
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

Start backend server:

```bash
# Development
npm start

# Kill running instance on port (if needed)
  - Multiple notification types
```

### 3. Frontend Setup (Shopdev-web-react-vite)

```bash
cd Shopdev-web-react-vite/shopde.anonystick.com
npm install
npm run dev
```

The frontend will be available at the port specified by Vite (default: 5173).

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

## 📁 Backend Project Structure

```
src/
├── app.js                # Express app setup
├── configs/              # Configuration files
├── controllers/          # Route controllers
├── core/                 # Core response classes
├── dbs/                  # Database initialization
├── helpers/              # Utility helpers
├── middlewares/          # Express middlewares
├── models/               # Mongoose models
│   └── repositories/     # Data access layer
├── routers/              # API routes
├── services/             # Business logic
└── utils/                # Utility functions
```

## 📁 Frontend Project Structure

See `Shopdev-web-react-vite/shopde.anonystick.com/` for the React app structure.

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

See the `docs/` folder for detailed guides:

- [Design Patterns](docs/DesignPattern.md)
- [Database Architecture](docs/DatabaseRevision.md)
- [Distributed Locks](docs/Distributed-Locks-Nodejs.md)
- [MySQL Indexing](docs/MySQL-index.md)
- [Redis](docs/Redis.md)
- [Message Queues](docs/RabbitMQ.md)
- [Authorization & RBAC](<docs/Authorization(User-Role-Menu).md>)
- [API Key Middleware](docs/CustomDynamicMiddleware_APIKEY.md)
- [Certbot SSL](docs/CertbotForSSLHTTPSecure.md)
- [Partitioning](docs/PartitionDatabase.md)
- [SKU & SPU](docs/SKUAndSPUInProductService.md)
- [TOTP & HOTP](docs/TOTPAndHOTP.md)

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
4. Push to your branch
5. Open a Pull Request
