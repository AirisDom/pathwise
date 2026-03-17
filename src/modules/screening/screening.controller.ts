import { Request, Response, NextFunction } from "express";
import { ScreeningService } from "./screening.service";
import { sendSuccess, sendCreated } from "../../utils/response";

const service = new ScreeningService();

export class ScreeningController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.create(req.user!.userId, req.body);
      sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await service.findAll(req.user!.userId);
      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.findById(req.user!.userId, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
