const { generateThumbnail, ffmpegProcessMap } = require("../utils/utils");

exports.getRooms = async (req, res, next) => {
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
};
