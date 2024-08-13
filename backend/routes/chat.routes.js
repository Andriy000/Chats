import express from "express";
import {  getUsersChat, getMessages, addUser, createChat, deleteChat, removeUser } from "../controllers/chat.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/:chatId/add-participant", protectRoute, addUser);
router.post("/create", protectRoute, createChat);
router.get("/:chatId/get-messages", protectRoute, getMessages)
router.get("/get-users-chats/:participantId", getUsersChat);
router.delete("/delete/:chatId", protectRoute, deleteChat);
router.delete("/:chatId/delete-participant", protectRoute, removeUser);

export default router;