const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Define the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("pause_request", () => {
    console.log("Pause requested from client");
    io.emit("pause");
  });

  socket.on("play_request", () => {
    console.log("Play requested from client");
    io.emit("play");
  });

  socket.on("start_video_request", () => {
    console.log("Start video requested from client");
    io.emit("start_video");
  });

  socket.on("seekFB", (videoTime) => {
    console.log("Foerward/backward requested");
    io.emit("seekingFB", videoTime);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// Start the server
const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
