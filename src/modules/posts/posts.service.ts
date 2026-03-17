import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreatePostInput } from "./posts.schema";

export class PostsService {
  async create(userId: string, input: CreatePostInput) {
    return prisma.post.create({
      data: {
        userId,
        title: input.title,
        body: input.body,
        isAnonymous: input.isAnonymous,
      },
      select: {
        id: true,
        title: true,
        body: true,
        isAnonymous: true,
        createdAt: true,
      },
    });
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { body: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          body: true,
          isAnonymous: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Strip author name from anonymous posts
    const sanitised = posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      isAnonymous: post.isAnonymous,
      authorName: post.isAnonymous ? null : post.user.name,
      createdAt: post.createdAt,
    }));

    return {
      posts: sanitised,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        body: true,
        isAnonymous: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    if (!post) {
      throw ApiError.notFound("Post not found");
    }

    return {
      id: post.id,
      title: post.title,
      body: post.body,
      isAnonymous: post.isAnonymous,
      authorName: post.isAnonymous ? null : post.user.name,
      createdAt: post.createdAt,
    };
  }

  async delete(userId: string, id: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw ApiError.notFound("Post not found");
    }
    if (post.userId !== userId) {
      throw ApiError.forbidden("You can only delete your own posts");
    }
    await prisma.post.delete({ where: { id } });
  }
}
