import { Router } from "express";
import { WorksheetsController } from "./worksheets.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { createWorksheetSchema, updateWorksheetSchema } from "./worksheets.schema";

const router = Router();
const controller = new WorksheetsController();

router.use(authenticate);

router.post("/", validate(createWorksheetSchema), controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.put("/:id", validate(updateWorksheetSchema), controller.update);
router.delete("/:id", controller.delete);

export default router;
