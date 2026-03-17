import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { ResourceCategory, ResourceAudience } from "@prisma/client";

export class ResourcesService {
  async findAll(category?: string, audience?: string) {
    const where: { category?: ResourceCategory; audience?: ResourceAudience } = {};
    if (category) where.category = category as ResourceCategory;
    if (audience) where.audience = audience as ResourceAudience;

    return prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      throw ApiError.notFound("Resource not found");
    }
    return resource;
  }
}
