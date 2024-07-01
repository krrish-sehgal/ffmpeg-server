const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");

const streamsDir = path.join(__dirname, "output");
const thumbnailsDir = path.join(__dirname, "thumbnails");

const app = express();

// Ensure thumbnails directory exists
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

function generateFilename(roomName) {
  const streamPath = path.join(streamsDir, `${roomName}`);
  fs.mkdirSync(streamPath, { recursive: true });
  return path.join(streamPath, "index.m3u8");
}

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/output", express.static(path.join(__dirname, "output")));
app.use("/thumbnails", express.static(path.join(__dirname, "thumbnails")));

app.post("/chunk/:roomName", (req, res) => {
  req.on("data", (chunk) => {
    handleChunk(req.params.roomName, chunk);
  });

  req.on("end", () => {
    console.log(`Stream stopped for ${req.params.roomName}`);
    ffmpegProcessMap[req.params.roomName].stdin.end();
  });

  res.sendStatus(200);
});

const ffmpegProcessMap = {};

// Function to handle received chunk data for a specific room
function handleChunk(roomName, chunkData) {
  const filename = generateFilename(roomName);

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

async function generateThumbnail(roomName) {
  const input = path.join(streamsDir, roomName, "index.m3u8");
  const output = path.join(thumbnailsDir, `${roomName}.jpg`);

  if (!fs.existsSync(input) || fs.statSync(input).size === 0) {
    console.log(`Input file for room ${roomName} does not exist or is empty.`);
    return;
  }

  const ffmpegCommand = [
    "-y", // Overwrite output files without asking
    "-i",
    input,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    output,
  ];

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn("ffmpeg", ffmpegCommand);

    ffmpegProcess.on("error", (error) => {
      console.error(
        `Error generating thumbnail for room ${roomName}: ${error.message}`
      );
      reject(error);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      const outputMessage = data.toString().toLowerCase();
      if (outputMessage.includes("file already exists")) {
        console.log(
          `Thumbnail for room ${roomName} already exists, overwriting.`
        );
        resolve(); // Resolve even if file exists, since we're overwriting
      } else {
        console.error(`ffmpeg stderr for room ${roomName}: ${data}`);
      }
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(
          `ffmpeg process for room ${roomName} exited with code ${code}`
        );
        reject(new Error(`ffmpeg process exited with code ${code}`));
      } else {
        console.log(`Thumbnail generated for room ${roomName}`);
        resolve();
      }
    });
  });
}

// Ensure thumbnails directory exists
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

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

// Endpoint to get active rooms and their thumbnails
app.get("/getRooms", async (req, res) => {
  const rooms = [];

  for (const roomName in ffmpegProcessMap) {
    try {
      await generateThumbnail(roomName);
      rooms.push({
        name: roomName,
        thumbnail: `/thumbnails/${roomName}.jpg`,
      });
    } catch (error) {
      console.error(
        `Error generating thumbnail for room ${roomName}: ${error.message}`
      );
    }
  }

  res.json(rooms);
});
// Start the Express server
const server = app.listen(9000, () => {
  console.log("Server listening on port 9000");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
