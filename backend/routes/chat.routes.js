import express from "express";
import { addUser, createChat, deleteChat, removeUser } from "../controllers/chat.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/:chatId/add-user", protectRoute, addUser);
router.post("/create", protectRoute, createChat);
router.delete("/delete/:chatId", protectRoute, deleteChat);
router.delete("/:chatId/delete-participant", protectRoute, removeUser);

export default router;