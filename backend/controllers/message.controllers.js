import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// in this method we are showing the users that are currently logged in in the system rather than the currnt user
export const getUsersFromSideBar = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: currentUser } }).select(
      "-password"
    );

    res.status(200).json(filterUsers);
  } catch (error) {
    console.log("error in the getUserFromSideBar=" + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//getting the messages from the current and the clicked user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    //current user id
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(201).json(messages);
  } catch (error) {
    console.log("error in the getMessages=" + error);
    res.status(500).json({ error: "internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    //creating the message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //saving the message to the database
    await newMessage.save();
    //todo realtime functionality goes here using socket.io

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in the sendMessage=" + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
