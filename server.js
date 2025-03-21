require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const connection = require("./config/DBconnection");
const app = express();
const cookieParser = require('cookie-parser');
const { verifyToken } = require("./utils/verifyToken");
const userSocketIds = new Map();


app.use(
    cors({
        origin: [process.env.ORIGIN, process.env.ORIGIN_GLOBAL],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: [process.env.ORIGIN, process.env.ORIGIN_GLOBAL], methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], },
});

app.use("/user", require("./routes/user.route"));
app.use("/request", require("./routes/request.route"));
app.use("/friend", require("./routes/friend.route"));
app.use("/refresh",require("./controllers/refresh.controller"));

io.on("connection", (socket) => {
    console.log(socket);
    socket.on("user-joined" , (data) => {
        const { userId } = data;
        userSocketIds.set(userId,socket.id);
    });





 });

connection().then(() => {
    server.listen(process.env.PORT, () => {
        console.log("server running at", process.env.PORT);
    });
});