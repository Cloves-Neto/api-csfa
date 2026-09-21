import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { IPostProps } from "../../models/iPostProps";

export interface IUpdatePostData {
    title?: string | undefined;
    content?: string | undefined;
    slug?: string | undefined;
    excerpt?: string | null | undefined;
    coverImageId?: string | null | undefined;
    isEvent?: boolean | undefined;
    published?: boolean | undefined;
    tagIds?: string[] | undefined;
}

export class PostUpdaterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async updatePost(id: string, data: IUpdatePostData): Promise<IPostProps | null> {
        try {
            if (data.tagIds) {
                await this.prisma.postTag.deleteMany({ where: { postId: id } });
            }

            const updateData: any = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.content !== undefined) updateData.content = data.content;
            if (data.slug !== undefined) updateData.slug = data.slug;
            if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
            if (data.coverImageId !== undefined) updateData.coverImageId = data.coverImageId;
            if (data.isEvent !== undefined) updateData.isEvent = data.isEvent;

            if (data.published !== undefined) {
                updateData.published = data.published;
                if (data.published) {
                    updateData.publishedAt = new Date();
                }
            }

            if (data.tagIds && data.tagIds.length > 0) {
                updateData.tags = {
                    create: data.tagIds.map((tagId) => ({ tagId })),
                };
            }

            const post = await this.prisma.post.update({
                where: { id },
                data: updateData,
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
            console.error(`Erro ao atualizar post: ${e}`);
            return null;
        }
    }

    public async togglePublish(id: string): Promise<IPostProps | null> {
        try {
            const current = await this.prisma.post.findUnique({ where: { id } });
            if (!current) return null;

            const nextPublished = !current.published;

            const updated = await this.prisma.post.update({
                where: { id },
                data: {
                    published: nextPublished,
                    publishedAt: nextPublished ? new Date() : null,
                },
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

            return updated as unknown as IPostProps;
        } catch (e) {
            console.error(`Erro ao alternar publicação do post: ${e}`);
            return null;
        }
    }
}
