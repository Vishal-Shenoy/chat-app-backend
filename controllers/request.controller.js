const RequestModel = require("../model/request.madel");
const FriendModel = require("../model/friends.model");

const createRequest = async (req, res) => {
  try {
    console.log(req.body);
    const { requesterId, requestedId } = req.body;

    // Validate that both IDs are provided
    if (!requesterId || !requestedId) {
      return res
        .status(400)
        .json({ message: "Both requesterId and requestedId are required" });
    }

    // Ensure requesterId and requestedId are not the same
    if (requesterId === requestedId) {
      return res
        .status(400)
        .json({ message: "Requester and Requested cannot be the same user" });
    }

    // Check if a request already exists with the same requesterId and requestedId
    const existingRequest = await RequestModel.findOne({
      requesterId,
      requestedId,
    });

    if (existingRequest) {
      return res.status(409).json({ message: "Request already exists" });
    }

    // Create a new request document
    const newRequest = new RequestModel({
      requesterId: requesterId,
      requestedId: requestedId,
    });

    // Save the document to the database
    await newRequest.save();

    return res.status(200).json({
      message: "Request sent successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRequestById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Request ID is required" });
    }
    const deletedRequest = await RequestModel.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({
      message: "Request deleted successfully",
      data: deletedRequest,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }
    const friendRequest = await RequestModel.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    const { rquesterId, requestedId } = friendRequest;

    // Create a new friendship in the FriendModel
    const friendship = await FriendModel.create({
      user1: rquesterId,
      user2: requestedId,
    });

    // Delete the friend request after accepting it
    await RequestModel.findByIdAndDelete(requestId);

    return res.status(200).json({
      message: "Friend request accepted successfully",
      friendship,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { requesterId, requestedId } = req.body;

    if (!requesterId || !requestedId) {
      return res
        .status(400)
        .json({ message: "Both requesterId and requestedId are required" });
    }

    // Find and delete the request
    const deletedRequest = await RequestModel.findOneAndDelete({
      requesterId,
      requestedId,
    });

    if (!deletedRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res
      .status(200)
      .json({ message: "Friend request deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.params.id;
    const myRequests = await RequestModel.find({ requestedId: userId })
      .populate("requesterId", "userName email profileUrl _id")
      .exec();

      console.log(myRequests)

    return res.status(200).json({ myRequests: myRequests, message: "My Requests" });
  } catch (error) {
    return res.status(200).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createRequest,
  deleteRequestById,
  acceptFriendRequest,
  deleteRequest,
  getMyRequests,
};
