import { Router } from "express";
import { PostsController } from "./posts.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { createPostSchema } from "./posts.schema";

const router = Router();
const controller = new PostsController();

router.use(authenticate);

router.post("/", validate(createPostSchema), controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.delete("/:id", controller.delete);

export default router;
