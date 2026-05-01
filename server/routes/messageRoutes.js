import express from "express";
import { protectRoute } from "./../middleware/auth.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/messageControllers.js";
import { markMessageAsSeen } from "./../controllers/messageControllers.js";

const messageRoutes = express.Router();
messageRoutes.get("/users", protectRoute, getUsersForSidebar);
messageRoutes.get("/:id", protectRoute, getMessages);
messageRoutes.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRoutes.post("/send/:id", protectRoute, sendMessage);

export default messageRoutes;
