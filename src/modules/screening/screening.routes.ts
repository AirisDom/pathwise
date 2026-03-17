import { Router } from "express";
import { ScreeningController } from "./screening.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { createScreeningSchema } from "./screening.schema";

const router = Router();
const controller = new ScreeningController();

router.use(authenticate);

router.post("/", validate(createScreeningSchema), controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);

export default router;
