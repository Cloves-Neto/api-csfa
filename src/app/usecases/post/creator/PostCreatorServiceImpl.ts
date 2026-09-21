import { PostGetterRepository } from "../../../repositories/post/postGetterRepository";
import { PostCreatorRepository } from "../../../repositories/post/postCreatorRepository";
import type { IPostProps } from "../../../models/iPostProps";
import type PostCreatorService from "./postCreatorService";
import type { ICreatePostDTO } from "./postCreatorService";

export default class PostCreatorServiceImpl implements PostCreatorService {
    private postGetterRepository: PostGetterRepository;
    private postCreatorRepository: PostCreatorRepository;

    public constructor() {
        this.postGetterRepository = new PostGetterRepository();
        this.postCreatorRepository = new PostCreatorRepository();
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }

    public async create(data: ICreatePostDTO): Promise<IPostProps | null> {
        let slug = data.slug && data.slug.trim().length > 0 ? data.slug : this.generateSlug(data.title);

        const existing = await this.postGetterRepository.postsGetBySlug(slug);
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const post = await this.postCreatorRepository.createPost({
            title: data.title,
            content: data.content,
            slug,
            excerpt: data.excerpt ?? null,
            coverImageId: data.coverImageId ?? null,
            isEvent: data.isEvent ?? false,
            authorId: data.authorId,
            published: data.published ?? false,
            publishedAt: data.published ? new Date() : null,
            tagIds: data.tagIds,
        });

        return post;
    }
}

