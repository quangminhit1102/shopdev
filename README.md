# ShopDev

ShopDev is a Node.js backend project for building and managing an e-commerce platform. It provides a modular, scalable API server using Express and MongoDB, supporting product management, authentication, and shop operations.

## Features

- **Product Management:**
  - CRUD operations for products
  - Product search and filtering
  - Publish/unpublish products
  - Support for multiple product types (e.g., clothing, electronics)
- **Authentication & Authorization:**
  - Shop and user registration/login
  - API key and token-based authentication
  - Middleware for route protection
- **Design Patterns:**
  - Factory and Strategy patterns for product creation and management
  - Centralized error and success response handling
- **Database:**
  - MongoDB with Mongoose ODM
  - Modular repository pattern for data access
- **Middleware:**
  - Error handling
  - Authentication and API key validation
  - Async handler for controller logic
- **Testing:**
  - API and unit tests with sample test cases
- **Documentation:**
  - Design patterns, database notes, and security concepts in the `docs/` folder

## Project Structure

```
src/
  app.js                # Express app setup
  configs/              # Configuration files (MongoDB, etc.)
  controllers/          # Route controllers (access, product, ...)
  core/                 # Core response classes
  dbs/                  # Database initialization
  helpers/              # Helper utilities (async handler, connection checks)
  middlewares/          # Express middlewares (error handler, auth)
  models/               # Mongoose models (product, shop, apiKey, ...)
    repositories/       # Data access layer
  routers/              # Express routers (access, product, ...)
  services/             # Business logic and service classes
  utils/                # Utility functions
server.js               # Entry point
package.json            # Project dependencies and scripts
docs/                   # Documentation and design notes
tests/                  # API and unit tests
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure MongoDB:**
   - Edit `src/configs/config.mongodb.js` with your MongoDB URI and options.
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Run tests:**
   ```bash
   npm test
   ```

## API Overview

- **Authentication:** `/v1/api/access/`
- **Product Management:** `/v1/api/product/`
- **API Key Management:** `/v1/api/key/`

See the `docs/` folder for detailed API documentation, design patterns, and security notes.

## Notable Files

- `src/utils/index.js`: Utility functions for object manipulation and MongoDB queries
- `src/middlewares/errorHandler.js`: Centralized error handling
- `src/services/`: Business logic for access, product, and API key management
- `src/models/`: Mongoose schemas for all entities
