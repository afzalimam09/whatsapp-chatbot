import { Router } from "express";
import {
  createChatSession,
  deleteOneChatSession,
  getAllChatSession,
  getAllPendingChatSession,
  getOneChatSession,
  updateChatSession,
} from "../controller/chatSessionController.js";
import { protect } from "../controller/authController.js";
const router = Router();

router.use(protect)
router.get("/", getAllChatSession);
router.get("/pending", getAllPendingChatSession);
router.post("/", createChatSession);

router.get("/:id", getOneChatSession);
router.put("/:id", updateChatSession);
router.delete("/:id", deleteOneChatSession);

export default router;
