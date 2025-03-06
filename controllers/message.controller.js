const MessageModel = require("../model/message.model");

const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMessage = await MessageModel.create({
            senderId,
            receiverId,
            message,
        });

        return res.status(201).json({
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Both user IDs are required" });
        }

        const messages = await MessageModel.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 }); 

        return res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const markAsRead = async (req, res) => {
    try {
        const  messageId  = req.params.messageId;

        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }

        const updatedMessage = await MessageModel.findByIdAndUpdate(
            messageId,
            { isRead: true },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message marked as read",
            data: updatedMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }

        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message deleted successfully",
            data: deletedMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newMessage } = req.body;

        if (!messageId || !newMessage) {
            return res.status(400).json({
                message: "Message ID and new message content are required",
            });
        }

        const updatedMessage = await MessageModel.findByIdAndUpdate(
            messageId,
            { message: newMessage, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({
            message: "Message updated successfully",
            data: updatedMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = {sendMessage,getMessages,markAsRead,deleteMessage,editMessage}