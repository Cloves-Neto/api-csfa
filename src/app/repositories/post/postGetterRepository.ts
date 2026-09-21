import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IPostProps } from "../../models/iPostProps";

export interface IFindPostsFilters {
    search?: string | undefined;
    status?: "published" | "draft" | "all" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export interface IPaginatedPostsResult {
    posts: IPostProps[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class PostGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async postsGetAll(filters: IFindPostsFilters = {}): Promise<IPaginatedPostsResult> {
        try {
            const page = filters.page && filters.page > 0 ? Number(filters.page) : 1;
            const limit = filters.limit && filters.limit > 0 ? Number(filters.limit) : 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (filters.search) {
                const term = filters.search.trim();
                where.OR = [
                    { title: { contains: term, mode: "insensitive" } },
                    { excerpt: { contains: term, mode: "insensitive" } },
                    { content: { contains: term, mode: "insensitive" } },
                ];
            }

            if (filters.status === "published") {
                where.published = true;
            } else if (filters.status === "draft") {
                where.published = false;
            }

            const [total, rawPosts] = await Promise.all([
                this.prisma.post.count({ where }),
                this.prisma.post.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        tags: {
                            include: { tag: true },
                        },
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                imageUrl: true,
                            },
                        },
                    },
                }),
            ]);

            return {
                posts: rawPosts as unknown as IPostProps[],
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1,
                },
            };
        } catch (e) {
            console.error(`Erro ao buscar posts : ${e}`);
            return {
                posts: [],
                meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
            };
        }
    }

    public async postsGetById(postId: string): Promise<IPostProps | null> {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
                include: {
                    tags: {
                        include: { tag: true },
                    },
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            imageUrl: true,
                        },
                    },
                },
            });
            return (post as unknown as IPostProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar post por id : ${e}`);
            return null;
        }
    }

    public async postsGetBySlug(slug: string): Promise<IPostProps | null> {
        try {
            const post = await this.prisma.post.findUnique({
                where: { slug },
                include: {
                    tags: {
                        include: { tag: true },
                    },
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            imageUrl: true,
                        },
                    },
                },
            });
            return (post as unknown as IPostProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar post por slug : ${e}`);
            return null;
        }
    }
}