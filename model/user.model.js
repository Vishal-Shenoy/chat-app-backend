const mongoose = require("mongoose");
const path = require('path');
const validator = require("validator");
const Schema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 10,
        },
        email: {
            type: String,
            default: "",
            required: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Enter Valid Email");
                }
            },
        },
        password: {
            type: String,
            default: "",
            required: true,
            minlength: 8,
        },
        profileUrl: {
            type: String,
            default: path.join('/assets', 'defaultprofile.jpeg'),
        },
        token: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

const UserModel = new mongoose.model("UserModel", Schema);
module.exports = UserModel;