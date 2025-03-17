const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.controller");
const { verifyToken } = require("../utils/verifyToken");
router.get("/getMessage/:senderId/:receiverId", verifyToken, controller.getMessages);
module.exports = router;