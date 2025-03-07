const mongoose = require("mongoose");
const Schema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
          },
        requestedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
          },
    },
    { timestamps: true }
);

const RequestModel = new mongoose.model("RequestModel", Schema);
module.exports = RequestModel;