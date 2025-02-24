const app = require("./src/app");

const {
  app: { port: PORT },
} = require("./src/configs/config.mongodb");

const server = app.listen(3000, () => {
  // console.log(`Server running on port ${PORT}`);
});

// Add event listener for SIGINT signal (Ctrl+C)
// When the process receives SIGINT, gracefully close the server
process.on("sigint", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});

