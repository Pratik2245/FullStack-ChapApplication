import jwt from "jsonwebtoken";
import { config } from "dotenv";
import User from "../models/user.model.js";
config({ path: "./dotenv/.env" });
export const protectRoute = async (req, res, next) => {
  try {
    const token1 = req.cookies.jwt;
    // console.log("Cookies: ", req.cookies);
    if (!token1 || typeof token1 !== "string") {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token1, process.env.JWT_SECRET);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized-Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(400).json({ message: "user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in the protection Route=" + error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
