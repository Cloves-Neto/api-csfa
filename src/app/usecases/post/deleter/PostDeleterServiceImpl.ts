import { PostDeleterRepository } from "../../../repositories/post/postDeleterRepository";
import type PostDeleterService from "./postDeleterService";

export default class PostDeleterServiceImpl implements PostDeleterService {
    private postDeleterRepository: PostDeleterRepository;

    public constructor() {
        this.postDeleterRepository = new PostDeleterRepository();
    }

    public async delete(id: string): Promise<boolean> {
        return await this.postDeleterRepository.deletePost(id);
    }
}
