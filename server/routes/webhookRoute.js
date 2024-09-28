import { Router } from "express";
import { whatsappWebhook, whatsappWebhookGet } from "../controller/webhookController.js";

const router = Router();

router.get("/", whatsappWebhookGet);
router.post("/", whatsappWebhook);

export default router;
