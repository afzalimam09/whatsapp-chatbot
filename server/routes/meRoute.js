import { Router } from "express";
import { protect } from "../controller/authController.js";
import { updateMe } from "../controller/meController.js";
import { speakToHuman } from "../controller/webhookActions.js";
const router = Router();

router.post('/test', async(req, res, next) => {
    try {
       await speakToHuman(req.body.phone, req.body.name);
       res.send("done")
    } catch (error) {
        console.log(error)
    }
})
router.use(protect)
router.put("/", updateMe);


export default router;
