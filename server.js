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
const MESSAGE_MODEL = require("./model/message.model");
const { updateMessage } = require("./controllers/friend.controller");
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
app.use("/message", require("./routes/message.route"));
app.use("/refresh", require("./controllers/refresh.controller"));

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.ORIGIN, process.env.ORIGIN_GLOBAL],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
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
        io.to(receiverId).emit("trigger-notification-user", {
            message: "Fetch Notification",
        });
    });

    socket.on("trigger-user", (data) => {
        const { userId } = data;
        const receiverId = userSocketIds.get(userId);
        io.to(receiverId).emit("trigger-user-list", {
            message: "Fetch Notification",
        });
    });

    socket.on("check-online", (data) => {
        const { userId, myId } = data;
        const receiverId = userSocketIds.get(userId);
        const mySocketId = userSocketIds.get(myId);

        if (receiverId != undefined || receiverId != null)
            io.to(mySocketId).emit("check-online-user", {
                message: "online",
                ...data,
            });
        else
            io.to(mySocketId).emit("check-online-user", {
                message: "offline",
                ...data,
            });
    });

    socket.on("send-message", async (data) => {
        const { message, receiverId, senderId } = data;
        const receiverSocketId = userSocketIds.get(receiverId);
        const senderSocketId = userSocketIds.get(senderId);

        const result = await MESSAGE_MODEL.create({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
        });

        io.to(senderSocketId).emit("send-message-user", result);
        io.to(receiverSocketId).emit("send-message-user", result);
        io.to(senderSocketId).emit(senderId?.toString(), {
            senderId: result?.senderId,
            receiverId: result?.receiverId,
            message: result?.message,
        });
        io.to(receiverSocketId).emit(receiverId?.toString(), {
            senderId: result?.senderId,
            receiverId: result?.receiverId,
            message: result?.message,
        });
        await updateMessage(senderId, receiverId, result?.message);
    });

    socket.on("delete-message", async (data) => {
        const { messageId, senderId, receiverId } = data;
        const receiverSocketId = userSocketIds.get(receiverId);
        const senderSocketId = userSocketIds.get(senderId);
        const result = await MESSAGE_MODEL.deleteOne({ _id: messageId });
        io.to(receiverSocketId).emit(`delete-message-user-${messageId}`, result);
        io.to(senderSocketId).emit(senderId?.toString(), {
            senderId: senderId,
            receiverId: receiverId,
            message: "Message Deleted",
        });
        io.to(receiverSocketId).emit(receiverId?.toString(), {
            senderId: senderId,
            receiverId: receiverId,
            message: "Message Deleted",
        });
    });

    socket.on("update-message", async (data) => {
        const { newMessage, messageId, receiverId, senderId } = data;
        const receiverSocketId = userSocketIds.get(receiverId);
        const senderSocketId = userSocketIds.get(senderId);
        const updatedMessage = await MESSAGE_MODEL.findByIdAndUpdate(
            messageId,
            { message: newMessage, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        io.to(receiverSocketId).emit(`update-message-user-${messageId}`, updatedMessage)
        await updateMessage(senderId, receiverId, newMessage);
        io.to(senderSocketId).emit(senderId?.toString(), {
            senderId: updatedMessage?.senderId,
            receiverId: updatedMessage?.receiverId,
            message: updatedMessage?.message,
        });
        io.to(receiverSocketId).emit(receiverId?.toString(), {
            senderId: updatedMessage?.senderId,
            receiverId: updatedMessage?.receiverId,
            message: updatedMessage?.message,
        });
    })
});

connection().then(() => {
    server.listen(process.env.PORT, () => {
        console.log("server running at", process.env.PORT);
    });
});
