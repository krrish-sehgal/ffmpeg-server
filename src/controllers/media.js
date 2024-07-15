const { handleChunk, ffmpegProcessMap } = require("../utils/utils");

exports.postMediaChunk = (req, res, next) => {
  console.log("endpoint hit");
  req.on("data", (chunk) => {
    handleChunk(req.params.roomName, chunk);
  });

  req.on("end", () => {
    console.log(`Stream stopped for ${req.params.roomName}`);
    ffmpegProcessMap[req.params.roomName].stdin.end();
    delete ffmpegProcessMap[req.params.roomName];
    
  });

  res.sendStatus(200);
};
