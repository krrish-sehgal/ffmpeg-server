const { handleChunk, ffmpegProcessMap } = require("../utils/utils");

exports.postMediaChunk = (req, res, next) => {
  console.log("endpoint hit");
  req.on("data", (chunk) => {
    handleChunk(req.params.roomName, chunk);
  });

  req.on("end", () => {
    console.log(`Stream stopped for ${req.params.roomName}`);
    ffmpegProcessMap[req.params.roomName].stdin.end();
  });

  res.sendStatus(200);
};
