const User = require("../model/user.model");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateToken");

const verifyRefresh = async (req, res) => {
    try {
        const token = req.cookies;
        const decoded = jwt.verify(token.jwt, process.env.REFRESH_SECRET);
        const userFound = await User.findOne({ _id: decoded._id });
        if (userFound) {
            const accessToken = generateAccessToken({
                _id: userFound._id,
                userName: userFound.userName,
                email: userFound.email,
                profileUrl: userFound.profileUrl,
            });
            res.status(200).json({accessToken : accessToken,message :"New Token Created"});
        } else {
            res.status(400).json({ message: "User not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
router.route("/").get(verifyRefresh);
module.exports = router;