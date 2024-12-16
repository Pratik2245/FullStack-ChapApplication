import { config } from "dotenv";
import mongoose from "mongoose";
config({ path: "./dotenv/.env" });
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.mongodb_url);
    console.log("Mongo db connected successfully " + conn.connection.host);
  } catch (error) {
    console.log("Mongo db connection error=" + error);
  }
};
