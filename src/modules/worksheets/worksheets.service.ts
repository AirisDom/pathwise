import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreateWorksheetInput, UpdateWorksheetInput } from "./worksheets.schema";
import { WorksheetType } from "@prisma/client";

export class WorksheetsService {
  async create(userId: string, input: CreateWorksheetInput) {
    return prisma.worksheet.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        responses: input.responses,
      },
    });
  }

  async findAll(userId: string, type?: string) {
    const where: { userId: string; type?: WorksheetType } = { userId };
    if (type) {
      where.type = type as WorksheetType;
    }
    return prisma.worksheet.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(userId: string, id: string) {
    const worksheet = await prisma.worksheet.findUnique({ where: { id } });
    if (!worksheet || worksheet.userId !== userId) {
      throw ApiError.notFound("Worksheet not found");
    }
    return worksheet;
  }

  async update(userId: string, id: string, input: UpdateWorksheetInput) {
    const worksheet = await prisma.worksheet.findUnique({ where: { id } });
    if (!worksheet || worksheet.userId !== userId) {
      throw ApiError.forbidden("You do not own this worksheet");
    }
    return prisma.worksheet.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.responses !== undefined && { responses: input.responses }),
      },
    });
  }

  async delete(userId: string, id: string) {
    const worksheet = await prisma.worksheet.findUnique({ where: { id } });
    if (!worksheet || worksheet.userId !== userId) {
      throw ApiError.forbidden("You do not own this worksheet");
    }
    await prisma.worksheet.delete({ where: { id } });
  }
}
