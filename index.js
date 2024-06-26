const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const streamsDir = path.join(__dirname, "output");

const app = express();

function generateFilename(roomName) {
  const streamPath = path.join(streamsDir, `${roomName}`);
  fs.mkdirSync(streamPath, { recursive: true });
  return path.join(streamPath, "index.m3u8");
}

app.use("/", express.static(path.join(__dirname, "public")));
// app.use("/output", express.static(path.join(__dirname, "output")));

app.post("/chunk/:roomName", (req, res) => {
  console.log("hcc");
  req.on("data", (chunk) => {
    // console.log(⁠ Chunk for ${req.params.roomName} ⁠)
    handleChunk(req.params.roomName, chunk);
  });

  req.on("end", () => {
    ffmpegProcessMap[req.params.roomName].stdin.end();
  });
});

app.use("/output", express.static(path.join(__dirname, "output")));

const ffmpegProcessMap = {};

// Function to handle received chunk data for a specific room
function handleChunk(roomName, chunkData) {
  const filename = generateFilename(roomName);
  // console.log(chunkData.length);

  // Ensure streams directory exists
  if (!fs.existsSync(streamsDir)) {
    fs.mkdirSync(streamsDir, { recursive: true });
  }

  if (!ffmpegProcessMap[roomName]) {
    const ffmpegCommand = [
      "-i",
      "-",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-start_number",
      "0",
      "-hls_time",
      "5",
      "-segment_format",
      "mpegts",
      "-hls_flags",
      "append_list",
      "-hls_list_size",
      "0",
      "-force_key_frames",
      "expr:gte(t,n_forced*5)",
      filename,
    ];

    const ffmpegProcess = spawn("ffmpeg", ffmpegCommand);
    ffmpegProcess.stdout.on("data", (data) => {
      console.log("ffmpeg stdout:", data.toString());
    });
    ffmpegProcess.stderr.on("data", (data) => {
      console.log(data.toString());
    });
    ffmpegProcessMap[roomName] = ffmpegProcess;
  }

  ffmpegProcessMap[roomName].stdin.write(chunkData);
}

// Start the Express server
const server = app.listen(9000, () => {
  console.log("Server listening on port 9000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
