const express = require("express");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { Writable } = require("stream");

const app = express();
const port = 3001;
const hlsOutputPath = path.join(__dirname, "output", "roomName");

// Ensure output directory exists
if (!fs.existsSync(hlsOutputPath)) {
  fs.mkdirSync(hlsOutputPath, { recursive: true });
}

app.use(express.static("public"));
app.use("/output", express.static(path.join(__dirname, "output")));

// Endpoint to handle incoming stream data
app.post("/upload", (req, res) => {
  const writableStream = new Writable({
    write(chunk, encoding, callback) {
      ffmpeg()
        .input(chunk)
        .inputFormat("webm")
        .outputOptions([
          "-c:v copy",
          "-hls_time 10",
          "-hls_list_size 0",
          "-f hls",
        ])
        .output(path.join(hlsOutputPath, "index.m3u8"))
        .on("end", () => {
          console.log("FFmpeg processing finished");
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
        })
        .run();
      callback();
    },
  });

  req.pipe(writableStream);
  req.on("end", () => {
    res.status(200).send("Stream data received");
  });
});

// Endpoint to get HLS playlist and segments
app.get("/hls/:roomName/:fileName", (req, res) => {
  const roomName = req.params.roomName;
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "output", roomName, fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File not found", err);
      res.status(404).send("File not found");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
