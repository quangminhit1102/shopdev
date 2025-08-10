# ShopDev - E-commerce Platform

A robust, scalable e-commerce platform built with modern technologies including Node.js/Express.js backend, React frontend, and comprehensive features for online retail operations.

## 🚀 Features

### Backend Features

- **Authentication & Authorization**: JWT-based authentication with API key validation
- **Product Management**: Complete CRUD operations for products with SKU/SPU support
- **Order Management**: Full order lifecycle management
- **Real-time Notifications**: Multi-channel notification system (Email, SMS, Push)
- **Advanced Search**: Elasticsearch-powered product search and analytics
- **Caching**: Multi-level Redis caching for improved performance
- **Message Queuing**: RabbitMQ and Apache Kafka integration for distributed processing
- **File Storage**: Cloudinary integration for media management
- **Security**: Comprehensive security with Helmet, CORS, rate limiting, and XSS protection
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Jest and Supertest for comprehensive testing
- **Monitoring & Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) integration
- **Containerization**: Full Docker support with Docker Compose
- **Load Balancing**: Nginx reverse proxy configuration
- **Real-time Features**: Socket.io for live updates and notifications

### Frontend Features

- **Modern React**: Built with Vite for fast development
- **Tailwind CSS**: Utility-first styling framework
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: WebSocket integration for live notifications

### System Architecture

- **Microservices Architecture**: Service-oriented design with independent deployments
- **Distributed Systems**: Message queuing with RabbitMQ/Apache Kafka
- **Search & Analytics**: Elasticsearch for advanced search capabilities
- **Caching Strategy**: Multi-level caching with Redis
- **Database**: MongoDB with optimized indexing
- **Containerization**: Docker and Docker Compose for easy deployment
- **Load Balancing**: Nginx reverse proxy for horizontal scaling
- **Monitoring**: ELK Stack (Elasticsearch, Logstash, Kibana) for logging and monitoring
- **Real-time Communication**: WebSocket integration with Socket.io
- **Graceful Shutdown**: Proper resource cleanup and health checks

## 🛠 Technology Stack

### Backend

- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.21
- **Database**: MongoDB 5+
- **Cache**: Redis 5+
- **Search Engine**: Elasticsearch
- **Message Queue**: RabbitMQ, Apache Kafka
- **File Storage**: Cloudinary
- **Testing**: Jest, Supertest
- **Security**: JWT, API Keys, Helmet
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Logging & Monitoring**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Process Management**: PM2
- **Load Balancer**: Nginx
- **Real-time Communication**: Socket.io

### Frontend

- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Redux/Context API
- **HTTP Client**: Axios

### DevOps & Infrastructure

- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Log Management**: ELK Stack (Elasticsearch, Logstash, Kibana)

## 📁 Project Structure

```
ShopDev/
├── src/                           # Backend source code
│   ├── app.js                    # Express app setup
│   ├── configs/                  # Configuration files
│   ├── controllers/              # Route controllers
│   ├── core/                     # Core response classes
│   ├── dbs/                      # Database initialization
│   ├── helpers/                  # Utility helpers
│   ├── middlewares/              # Express middlewares
│   ├── models/                   # Mongoose models
│   │   └── repositories/         # Data access layer
│   ├── routers/                  # API routes
│   ├── services/                 # Business logic
│   └── utils/                    # Utility functions
├── Shopdev-web-react-vite/       # Frontend (React + Vite)
│   └── shopde.anonystick.com/    # React application
├── docs/                         # Documentation
├── tests/                        # Test suites
├── server.js                     # Backend entry point
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- MongoDB 5+
- Redis 5+
- Elasticsearch 7.x+
- Docker & Docker Compose (recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/quangminhit1102/shopdev.git
   cd shopdev
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   PORT=3055
   MONGODB_URI=your_mongodb_uri
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   ```

5. **Start the backend server**

   ```bash
   # Development mode
   npm start

   # Kill running instance on port (if needed)
   npm run kill
   ```

6. **Install and run frontend**
   ```bash
   cd Shopdev-web-react-vite/shopde.anonystick.com
   npm install
   npm run dev
   ```

The backend will be available at `http://localhost:3055` and the frontend at `http://localhost:5173` (or the port specified by Vite).

## 📚 API Documentation

### Authentication Endpoints

- `POST /access/signup` - Register new shop/user
- `POST /access/login` - Login user
- `POST /access/logout` - Logout user

### Product Endpoints

- `GET /product` - List products
- `POST /product` - Create product
- `GET /product/:id` - Get product details
- `PUT /product/:id` - Update product
- `DELETE /product/:id` - Delete product

### Order Endpoints

- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details

### Notification Endpoints

- `GET /notification` - Get user notifications

For complete API documentation, visit `/api-docs` when the server is running.

## 🔒 Security Features

- **HTTP Security Headers**: Implemented with Helmet.js
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Request rate limiting to prevent abuse
- **API Key Authentication**: Secure API access with key validation
- **JWT Token Validation**: Stateless authentication
- **Request Validation**: Input validation using Joi
- **SQL Injection Prevention**: Protected database queries
- **XSS Protection**: Cross-site scripting prevention

## 🏗 Architecture Patterns

- **RESTful API Design**: Standard REST principles
- **MVC Architecture**: Model-View-Controller pattern
- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Flexible algorithm selection
- **Factory Pattern**: Object creation abstraction
- **Centralized Response Handling**: Consistent API responses
- **Asynchronous Error Handling**: Proper error management

## ⚡ Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Redis Caching**: Multiple caching strategies
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression
- **Load Balancing Support**: Horizontal scaling ready
- **Graceful Shutdown**: Proper resource cleanup

## 📖 Documentation

Detailed documentation is available in the `docs/` folder:

- [Design Patterns](docs/DesignPattern.md)
- [Database Architecture](docs/DatabaseRevision.md)
- [Distributed Locks](docs/Distributed-Locks-Nodejs.md)
- [MySQL Indexing](docs/MySQL-index.md)
- [Redis Implementation](docs/Redis.md)
- [Message Queues](docs/RabbitMQ.md)
- [Authorization & RBAC](<docs/Authorization(User-Role-Menu).md>)
- [API Key Middleware](docs/CustomDynamicMiddleware_APIKEY.md)
- [SSL Configuration](docs/CertbotForSSLHTTPSecure.md)
- [Database Partitioning](docs/PartitionDatabase.md)
- [SKU & SPU Management](docs/SKUAndSPUInProductService.md)
- [TOTP & HOTP](docs/TOTPAndHOTP.md)

## 🐛 Error Handling

Centralized error handling with custom error classes:

- `BadRequestError` - 400 status codes
- `NotFoundError` - 404 status codes
- `AuthenticationError` - 401 status codes
- `ValidationError` - Input validation errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Guidelines

- Follow the existing code structure and patterns
- Write tests for new features
- Update documentation for significant changes
- Ensure all tests pass before submitting PRs
- Use meaningful commit messages

## 🔧 Environment Variables

| Variable            | Description               | Required |
| ------------------- | ------------------------- | -------- |
| `PORT`              | Server port               | Yes      |
| `MONGODB_URI`       | MongoDB connection string | Yes      |
| `REDIS_URL`         | Redis connection URL      | Yes      |
| `JWT_SECRET`        | JWT signing secret        | Yes      |
| `CLOUDINARY_NAME`   | Cloudinary cloud name     | Yes      |
| `CLOUDINARY_KEY`    | Cloudinary API key        | Yes      |
| `CLOUDINARY_SECRET` | Cloudinary API secret     | Yes      |
