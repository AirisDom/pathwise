import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreateScreeningInput } from "./screening.schema";

export class ScreeningService {
  async create(userId: string, input: CreateScreeningInput) {
    // Compute total EPDS score
    const score = input.responses.reduce((sum, r) => sum + r.answer, 0);

    return prisma.screeningResult.create({
      data: {
        userId,
        score,
        responses: input.responses,
      },
    });
  }

  async findAll(userId: string) {
    return prisma.screeningResult.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });
  }

  async findById(userId: string, id: string) {
    const result = await prisma.screeningResult.findUnique({ where: { id } });
    if (!result || result.userId !== userId) {
      throw ApiError.notFound("Screening result not found");
    }
    return result;
  }
}
