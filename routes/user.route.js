const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const multer = require("multer")
const upload = multer();
const { userValidator ,loginValidator} = require("../middlewares/user.validation");
const { verifyToken } = require("../utils/verifyToken");
router.post("/register", userValidator, controller.userRegister);
router.put("/login",loginValidator, controller.userLogin);
router.get("/:userId/:search", verifyToken ,controller.userSearch)
module.exports = router;