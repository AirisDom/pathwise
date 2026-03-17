import { Request, Response, NextFunction } from "express";
import { PostsService } from "./posts.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const service = new PostsService();

export class PostsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await service.create(req.user!.userId, req.body);
      sendCreated(res, post);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await service.findAll(page, limit, search);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await service.findById(req.params.id);
      sendSuccess(res, post);
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
