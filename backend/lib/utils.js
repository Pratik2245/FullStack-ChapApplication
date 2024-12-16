import jwt from "jsonwebtoken";
import { config } from "dotenv";
config({ path: "./dotenv/.env" });
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  // sending  to the user in the cookie

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 10000,
    httpOnly: true, //prevents XSS attack cross site scripting attack
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
