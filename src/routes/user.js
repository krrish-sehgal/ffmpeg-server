const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.get("/rooms", userController.getRooms);

module.exports = router;
