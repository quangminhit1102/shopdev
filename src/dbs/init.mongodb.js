/**
 * MongoDB Database Connection Module
 * Implements Singleton pattern for a single database connection instance
 * Handles connection lifecycle and debugging
 */

"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const {
  db: { host, name, port },
} = require("../configs/config.mongodb");

// MongoDB connection string
const connectString = `mongodb://${host}:${port}/${name}`;

// MongoDB connection options
const CONNECTION_OPTIONS = {
  maxPoolSize: 50, // Maximum number of connections in the pool (default: 5)
  minPoolSize: 10, // Minimum number of connections in the pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Enable retryable writes
};

class Database {
  constructor() {
    this.connect();
  }

  /**
   * Establishes connection to MongoDB
   * - Enables debugging in non-production environments
   * - Uses connection pool for better performance
   * - Implements error handling and logging
   */
  connect() {
    // Enable debugging in development
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", {
        color: true,
        shell: true, // Shell-like output
        verbose: true, // Detailed debug information
      });
    }

    mongoose
      .connect(connectString, CONNECTION_OPTIONS)
      .then(() => {
        console.log(
          `MongoDB Connected Successfully! Active connections: ${countConnect()}`
        );

        // Handle connection events
        mongoose.connection.on("connected", () => {
          console.log("Mongoose connected to MongoDB");
        });

        mongoose.connection.on("error", (err) => {
          console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
          console.log("Mongoose disconnected from MongoDB");
        });

        // Handle process termination
        process.on("SIGINT", this.closeConnection.bind(this));
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        // Retry connection after delay or exit based on your requirements
        setTimeout(() => this.connect(), 5000);
      });
  }

  /**
   * Gracefully close the MongoDB connection
   * Important for proper cleanup when the application shuts down
   */
  async closeConnection() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error while closing MongoDB connection:", err);
      process.exit(1);
    }
  }

  /**
   * Implementation of Singleton pattern
   * Ensures only one database connection instance exists
   */
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// Create and export a single instance
const instance = Database.getInstance();
module.exports = instance;
