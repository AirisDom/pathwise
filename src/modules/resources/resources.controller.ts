import { Request, Response, NextFunction } from "express";
import { ResourcesService } from "./resources.service";
import { sendSuccess } from "../../utils/response";

const service = new ResourcesService();

export class ResourcesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await service.findAll(
        req.query.category as string,
        req.query.audience as string
      );
      sendSuccess(res, resources);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await service.findById(req.params.id);
      sendSuccess(res, resource);
    } catch (error) {
      next(error);
    }
  }
}
