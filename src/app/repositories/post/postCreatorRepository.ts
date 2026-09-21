import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IPostProps } from "../../models/iPostProps";

export interface IPostCreateData {
    title: string;
    content: string;
    slug: string;
    excerpt?: string | null | undefined;
    coverImageId?: string | null | undefined;
    isEvent?: boolean | undefined;
    authorId: string;
    published?: boolean | undefined;
    publishedAt?: Date | null | undefined;
    tagIds?: string[] | undefined;
}

export class PostCreatorRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async createPost(data: IPostCreateData): Promise<IPostProps | null> {
        try {
            const createPayload: any = {
                title: data.title,
                content: data.content,
                slug: data.slug,
                excerpt: data.excerpt ?? null,
                coverImageId: data.coverImageId ?? null,
                isEvent: data.isEvent ?? false,
                authorId: data.authorId,
                published: data.published ?? false,
                publishedAt: data.publishedAt ?? (data.published ? new Date() : null),
            };

            if (data.tagIds && data.tagIds.length > 0) {
                createPayload.tags = {
                    create: data.tagIds.map((tagId) => ({ tagId })),
                };
            }

            const post = await this.prisma.post.create({
                data: createPayload,
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
            return post as unknown as IPostProps;
        } catch (e) {
            console.error(`Erro ao criar post: ${e}`);
            return null;
        }
    }
}

