require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const connection = require("./config/DBconnection");
const app = express();
const cookieParser = require("cookie-parser");
const { verifyToken } = require("./utils/verifyToken");
const { socketAuthentication } = require("./middlewares/auth");
const userSocketIds = new Map();

app.use(
    cors({
        origin: [process.env.ORIGIN, process.env.ORIGIN_GLOBAL],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

app.use("/user", require("./routes/user.route"));
app.use("/request", require("./routes/request.route"));
app.use("/friend", require("./routes/friend.route"));
app.use("/refresh", require("./controllers/refresh.controller"));

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.ORIGIN, process.env.ORIGIN_GLOBAL],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    },
});

io.use((socket, next) => {
    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthentication(err, socket, next)
    );
});

io.on("connection", (socket) => {
    const userId = socket?.user?._id?.toString();
    userSocketIds.set(userId, socket?.id);

    socket.on("trigger-notification", (data) => {
        const { userId } = data;
        const receiverId = userSocketIds.get(userId);
        io.to(receiverId).emit("trigger-notification-user", { message: "Fetch Notification" })
    })

    socket.on("trigger-user", (data) => {
        const { userId } = data;
        const receiverId = userSocketIds.get(userId);
        io.to(receiverId).emit("trigger-user-list", { message: "Fetch Notification" })
    })



});

connection().then(() => {
    server.listen(process.env.PORT, () => {
        console.log("server running at", process.env.PORT);
    });
});
