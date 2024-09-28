import { Router } from "express";
import {
  createMessage,
  deleteMessage,
  getAllMessage,
  getOneMessage,
  updateMessage,
} from "../controller/messageController.js";
import { protect } from "../controller/authController.js";

const router = Router();

router.use(protect)
router.get("/", getAllMessage);
router.post("/", createMessage);

router.get("/:id", getOneMessage);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

export default router;
