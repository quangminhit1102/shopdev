"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  return `- Number of connections::${numConnection}`;
};

// check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    // HeapUsed is the memory used by the Node.js process
    const memoryUsage_HeapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    // Resident Set Size (RSS) is the portion of memory occupied by a process that is held in main memory (RAM).
    const memoryUsage_RSS = process.memoryUsage().rss / 1024 / 1024;

    console.log(`Active connections::${numConnection}`);
    console.log(`Memory usage heap used:: ${memoryUsage_HeapUsed} MB`);
    console.log(`Memory usage rss:: ${memoryUsage_RSS} MB`);

    // Example maximum number of connections based on cores
    const maxConnections = numCores * 5;

    if (numConnection > maxConnections) {
      console.log(`Connection overload detected!`);
    }
  }, _SECONDS); // Monitor every 5 seconds
};

module.exports = {
  countConnect,
  checkOverload,
};
