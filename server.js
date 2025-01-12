const app = require("./src/app");

const PORT = 3055;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add event listener for SIGINT signal (Ctrl+C)
// When the process receives SIGINT, gracefully close the server
process.on("sigint", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
