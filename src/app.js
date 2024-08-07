const express = require("express");
const path = require("path");
const { generateThumbnail, ffmpegProcessMap } = require("./utils/utils");
const http = require("http");
const fs = require("fs");

const app = express();

const mediaRoutes = require("./routes/media");
const userRoutes = require("./routes/user");

// app.use("/", express.static(path.join(__dirname, "..", "public")));
app.use("/output", express.static(path.join(__dirname, "..", "output")));
app.use(
  "/thumbnails",
  express.static(path.join(__dirname, "..", "thumbnails"))
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/chunk", mediaRoutes);

app.use(userRoutes);

// Periodically generate thumbnails for active rooms
setInterval(async () => {
  for (const roomName in ffmpegProcessMap) {
    try {
      await generateThumbnail(roomName);
    } catch (error) {
      console.error(
        `Error generating thumbnail for room ${roomName}: ${error.message}`
      );
    }
  }
}, 30000);

// Use the PORT environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Start the Express server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  httpServer.close(() => {
    console.log("Server closed");
  });
});
