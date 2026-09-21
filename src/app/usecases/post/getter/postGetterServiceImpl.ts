import { PostGetterRepository, type IFindPostsFilters, type IPaginatedPostsResult } from "../../../repositories/post/postGetterRepository";
import type { IPostProps } from "../../../models/iPostProps";
import type PostGetterService from "./postGetterService";

export default class PostGetterServiceImpl implements PostGetterService {
    private postRepository: PostGetterRepository;

    public constructor() {
        this.postRepository = new PostGetterRepository();
    }

    public async getAll(filters: IFindPostsFilters = {}): Promise<IPaginatedPostsResult> {
        return await this.postRepository.postsGetAll(filters);
    }

    public async getById(postId: string): Promise<IPostProps | null> {
        let post = await this.postRepository.postsGetById(postId);
        if (!post) {
            post = await this.postRepository.postsGetBySlug(postId);
        }
        return post;
    }
}