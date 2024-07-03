const express = require("express");
const path = require("path");
const { generateThumbnail, ffmpegProcessMap } = require("./utils/utils");

const app = express();

const mediaRoutes = require("./routes/media");
const userRoutes = require("./routes/user");

app.use("/", express.static(path.join(__dirname, "..", "public")));
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

// Start the Express server
const server = app.listen(9000, () => {
  console.log("Server listening on port 9000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
