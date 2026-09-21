import { PostUpdaterRepository, type IUpdatePostData } from "../../../repositories/post/postUpdaterRepository";
import { PostGetterRepository } from "../../../repositories/post/postGetterRepository";
import type { IPostProps } from "../../../models/iPostProps";
import type PostUpdaterService from "./postUpdaterService";

export default class PostUpdaterServiceImpl implements PostUpdaterService {
    private postUpdaterRepository: PostUpdaterRepository;
    private postGetterRepository: PostGetterRepository;

    public constructor() {
        this.postUpdaterRepository = new PostUpdaterRepository();
        this.postGetterRepository = new PostGetterRepository();
    }

    public async update(id: string, data: IUpdatePostData): Promise<IPostProps | null> {
        const existing = await this.postGetterRepository.postsGetById(id);
        if (!existing) {
            throw new Error("Post não encontrado.");
        }
        return await this.postUpdaterRepository.updatePost(id, data);
    }

    public async togglePublish(id: string): Promise<IPostProps | null> {
        const existing = await this.postGetterRepository.postsGetById(id);
        if (!existing) {
            throw new Error("Post não encontrado.");
        }
        return await this.postUpdaterRepository.togglePublish(id);
    }
}
