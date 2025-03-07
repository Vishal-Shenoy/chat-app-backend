const express = require("express");
const router = express.Router();
const controller = require("../controllers/friend.controller");
const { verifyToken } = require("../utils/verifyToken");
router.get("/getFriends/:userId", verifyToken, controller.getFriends);
router.delete("/deleteFriend/:id", verifyToken, controller.deleteFriend);
module.exports = router;