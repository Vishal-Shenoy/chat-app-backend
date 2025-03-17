const FriendModel = require("../model/friends.model");

const getFriends = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const friendships = await FriendModel.find({
            $or: [{ user1: userId }, { user2: userId }],
        })
            .populate("user1", "userName email profileUrl")
            .populate("user2", "userName email profileUrl");
        const formattedFriends = friendships.map((friendship) => {
            return {
                me: userId,
                friend:
                    friendship.user1._id.toString() === userId
                        ? friendship.user2
                        : friendship.user1,
                message: friendship.message,
            };
        });

        return res.status(200).json({
            friends: formattedFriends,
            message: "Friends sent successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteFriend = async (req, res) => {
    try {
        const id = req.params.id; // Extract the document ID from request parameters

        // Validate the ID
        if (!id) {
            return res.status(400).json({ message: "Document ID is required" });
        }

        const deletedDocument = await FriendModel.findByIdAndDelete(id);

        if (!deletedDocument) {
            return res.status(404).json({ message: "Document not found" });
        }

        return res.status(200).json({
            message: "Document deleted successfully",
            deletedDocument,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateMessage = async (senderId, receiverId, message) => {
    try {
        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "userId and message are required" });
        }
        const friendship = await FriendModel.findOne({
            $or: [
                { user1: senderId, user2: receiverId },
                { user1: receiverId, user2: senderId },
            ],
        });
        friendship.message = message;
        await friendship.save();
        return;
    } catch (error) {
        return;
    }
};

module.exports = { getFriends, deleteFriend, updateMessage };
