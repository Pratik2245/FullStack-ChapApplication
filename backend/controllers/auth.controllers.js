import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import bcryptjs from "bcryptjs";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!email || !password || !fullName) {
      res.status(400).json({ message: "All Feilds Are Required" });
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "password must be of atleast 6 characters" });
    }
    const user = await User.findOne({ email }); //finding weather a user exists or not in the database or not
    if (user) {
      return res.status(400).json({ message: "user already exists" });
    }
    // now we will hash the password of encrypt the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword, // we are storing the hashed password in the database
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid User data" });
    }
  } catch (error) {
    console.log("error in signup page " + error);
    res.status(500).json({ message: "Internal serer error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userEmail = await User.findOne({ email: email });

    if (!userEmail) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPassCorrect = await bcryptjs.compare(password, userEmail.password);
    if (!isPassCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //generate the token
    generateToken(userEmail._id, res);
    res.status(201).json({
      _id: userEmail._id,
      fullName: userEmail.fullName,
      email: userEmail.email,
      profilePicture: userEmail.profilePicture,
      createdAt: userEmail.createdAt,
    });
  } catch (error) {
    console.log("error in the login controller" + error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(201).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout page " + error);
    res.status(500).json({ message: "Internal serer error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = async (req, res) => {
  try {
    res.status(201).json(req.user);
  } catch (error) {
    console.log("error in check auth controller123 " + error);
    res.status(500).json({ message: "Internal serer error" });
  }
};
