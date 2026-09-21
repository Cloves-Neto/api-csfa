import { TagDeleterRepository } from "../../../repositories/tag/tagDeleterRepository";
import type TagDeleterService from "./tagDeleterService";

export default class TagDeleterServiceImpl implements TagDeleterService {
    private tagDeleterRepository: TagDeleterRepository;

    public constructor() {
        this.tagDeleterRepository = new TagDeleterRepository();
    }

    public async delete(id: string): Promise<boolean> {
        return await this.tagDeleterRepository.deleteTag(id);
    }
}
