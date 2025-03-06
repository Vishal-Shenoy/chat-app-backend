const jwt = require("jsonwebtoken");
const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_SECRET, {
        expiresIn: "1h",
    });
};

const generateRefreshToken = (data) => {
    return jwt.sign(data, process.env.REFRESH_SECRET, {
        expiresIn: "1d",
    });
};

module.exports = { generateAccessToken, generateRefreshToken }