"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const configMongodb = require("../configs/config.mongodb");
const connectString = "mongodb://localhost:27017/express-mongo";

class Database {
  // Constructor
  constructor() {
    this.connect();
    console.log(configMongodb);
  }

  // Connect to MongoDB.
  connect() {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      // maxPoolSize is the maximum number of connections in the connection pool. if not set, the default is 5.
      // if the number of connections exceeds the maxPoolSize, the connection will be queued.
      .then(() => {
        console.log("Connected to MongoDB", countConnect());
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB", error);
      });
  }

  // Applied singleton pattern.
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instance = Database.getInstance();
module.exports = instance;
