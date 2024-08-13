import express from "express";
import { deleteMessage, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send/:userId", protectRoute, sendMessage);
router.delete("/delete/:messageId", protectRoute, deleteMessage)

export default router;
