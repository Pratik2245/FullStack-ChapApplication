import express from "express";
import { protectRoute } from "../middleware/authprotectRoute.middleware.js";
import {
  getUsersFromSideBar,
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controllers.js";
const router = express.Router();
router.get("/users", protectRoute, getUsersFromSideBar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
