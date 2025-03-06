const User = require("../model/user.model");
const jwt = require("jsonwebtoken");


const verifyToken = async (req, res,next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      const userFound = await User.findOne({ _id: decoded._id });
      if (userFound) {
        next();
      } else {
        return res.status(400).json({message : "User not found"});
      }
    } catch (err) {
      return res.status(401).json({message : "Token Expired"});
    }
  };

  
  module.exports= {verifyToken}