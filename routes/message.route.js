const express = require("express");
const router = express.Router();
const controller = require("../controllers/friend.controller");
const { verifyToken } = require("../utils/verifyToken");
module.exports = router;