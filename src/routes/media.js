const express = require("express");

const mediaController = require("../controllers/media");

const router = express.Router();

router.post("/:roomName", mediaController.postMediaChunk);

module.exports = router;
