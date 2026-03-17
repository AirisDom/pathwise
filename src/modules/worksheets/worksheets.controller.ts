import { Request, Response, NextFunction } from "express";
import { WorksheetsService } from "./worksheets.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const service = new WorksheetsService();

export class WorksheetsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const worksheet = await service.create(req.user!.userId, req.body);
      sendCreated(res, worksheet);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const worksheets = await service.findAll(req.user!.userId, req.query.type as string);
      sendSuccess(res, worksheets);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const worksheet = await service.findById(req.user!.userId, req.params.id);
      sendSuccess(res, worksheet);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const worksheet = await service.update(req.user!.userId, req.params.id, req.body);
      sendSuccess(res, worksheet);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await service.delete(req.user!.userId, req.params.id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
