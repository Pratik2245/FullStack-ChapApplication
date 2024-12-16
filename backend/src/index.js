import express, { json } from "express";
import authRoutes from "../routers/auth.route.js";
import messageRoutes from "../routers/message.route.js";
import { connectDB } from "../lib/db.js";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
config({ path: "./dotenv/.env" });
import cors from "cors";
import path from "path";
import { app, server } from "../lib/socket.js";
const __dirname = path.resolve();
connectDB();
// used to extract json data out off body like accessing the signup and login details
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
server.listen(process.env.port, () => {
  console.log(`app is listening to port ${process.env.port}`);
});
