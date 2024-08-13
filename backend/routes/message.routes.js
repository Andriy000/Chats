import express from "express";
import { resendMessage, rewriteMessage, deleteMessage, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send/:userId", protectRoute, sendMessage);
router.post("/:messageId/resend", protectRoute, resendMessage);
router.put("/:messageId/rewrite", protectRoute, rewriteMessage)
router.delete("/delete/:messageId", protectRoute, deleteMessage);

export default router;
