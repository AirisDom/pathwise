import { Router } from "express";
import { ResourcesController } from "./resources.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();
const controller = new ResourcesController();

router.use(authenticate);

router.get("/", controller.findAll);
router.get("/:id", controller.findById);

export default router;
