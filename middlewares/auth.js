const jwt = require("jsonwebtoken");
const USER_MODEL = require("../model/user.model");
const socketAuthentication = async (err, socket, next) => {
    try {
        if (err) return next(err);

        const authToken = socket.request.cookies["jwt"];
        if (!authToken)
            return next(new Error("Please Login to access this route", 401));

        const decoded = jwt.verify(authToken, process.env.REFRESH_SECRET);
        const user = await USER_MODEL.findById(decoded?._id);

        if (!user) return next(new Error("Please Login to access this route", 401));

        socket.user = user;
        return next();
    } catch (err) {
        console.log("", err);
        return next(new Error("Please Login to access this route", 401));
    }
};
module.exports = { socketAuthentication }