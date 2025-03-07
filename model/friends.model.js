const { required } = require("joi");
const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
            required:true
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
            required:true
        },
        message : {
            type: String,
            default: "",
        }
    },
    { timestamps: true }
);

const FriendModel = mongoose.model("FriendModel", FriendSchema);
module.exports = FriendModel;
