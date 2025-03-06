const bcrypt = require("bcryptjs");
const USER_MODEL = require("../model/user.model");
const FRIEND_MODEL = require("../model/friends.model");
const REQUEST_MODEL = require("../model/request.madel")
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const userRegister = async (req, res) => {
    console.log(req.body)
    try {
        const { userName, email, password } = req.body;

        const userExist = await USER_MODEL.findOne({ email: email });

        if (userExist) {
            return res
                .status(400)
                .json({ message: "User Exist with this Credentials" });
        }

        const create = new USER_MODEL({
            userName: userName,
            email: email,
            password: await bcrypt.hash(password, 7),
        });
        const result = await create.save();

        const accessToken = generateAccessToken({
            _id: result._id,
            userName: result.userName,
            email: result.email,
            profileUrl: result.profileUrl,
        });
        const refreshToken = generateAccessToken({
            _id: result._id,
            userName: result.userName,
            email: result.email,
            profileUrl: result.profileUrl,
        });
        result.token = refreshToken;
        await result.save();

        if (result) {
            res.cookie("jwt", refreshToken, {
                httpOnly: false,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({accessToken : accessToken,message:"User Created Successfully"});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await USER_MODEL.findOne({ email: email });
        if (userExist) {
            const isMatch = await bcrypt.compare(password, userExist.password);
            if (isMatch) {
                const accessToken = generateAccessToken({
                    _id: userExist._id,
                    userName: userExist.userName,
                    email: userExist.email,
                    profileUrl: userExist.profileUrl,
                });
                const refreshToken = generateRefreshToken({
                    _id: userExist._id,
                    userName: userExist.userName,
                    email: userExist.email,
                    profileUrl: userExist.profileUrl,
                });
                userExist.token = refreshToken;
                await userExist.save();

                if (userExist) {
                    res.cookie("jwt", refreshToken, {
                        httpOnly: false,
                        sameSite: "None",
                        secure: true,
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                    return res.status(200).json({accessToken : accessToken,message :"Login Successfull"});
                }
            } else {
                return res.status(400).json({ message: "Credentials Did not match" });
            }
        }
        return res.status(400).json({ message: "User Not Found" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const userSearch = async (req, res) => {
    try {
        const userId = req.params.userId;
        const searchKey = req.params.search;

        if (!searchKey) {
            return res.status(400).json({ message: "Search cannot be empty" });
        }

        // Get friend list where userId is either user1 or user2
        const friends = await FRIEND_MODEL.find({
            $or: [{ user1: userId }, { user2: userId }],
        });

        // Extract friend user IDs
        const friendIds = friends.map(friend =>
            friend.user1.toString() === userId ? friend.user2.toString() : friend.user1.toString()
        );

        // Get pending requests where userId is the requester
        const sentRequests = await REQUEST_MODEL.find({ requesterId: userId });

        // Extract requested user IDs
        const requestedIds = sentRequests.map(req => req.requestedId.toString());

        // Find users who are not friends
        const users = await USER_MODEL.find({
            _id: { $ne: userId, $nin: friendIds }, // Not the current user and not already a friend
            $or: [
                { userName: { $regex: searchKey, $options: "i" } },
                { email: { $regex: searchKey, $options: "i" } },
            ],
        }).select("userName email profileUrl");

        // Map results with `isFriendRequestSent` flag
        const formattedUsers = users.map(user => ({
            _id:user?._id,
            userName: user?.userName,
            email: user?.email,
            profileUrl: user?.profileUrl,
            isFriendRequestSent: requestedIds.includes(user?._id.toString()),
        }));

        return res.status(200).json({ users: formattedUsers, message: "Search List Sent Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { userRegister, userLogin, userSearch };
