import { TagGetterRepository } from "../../../repositories/tag/tagGetterRepository";
import type { ITagProps } from "../../../models/iTagProps";
import type TagGetterService from "./tagGetterService";

export default class TagGetterServiceImpl implements TagGetterService {
    private tagGetterRepository: TagGetterRepository;

    public constructor() {
        this.tagGetterRepository = new TagGetterRepository();
    }

    public async getAll(): Promise<ITagProps[]> {
        return await this.tagGetterRepository.tagsGetAll();
    }

    public async getById(id: string): Promise<ITagProps | null> {
        let tag = await this.tagGetterRepository.tagsGetById(id);
        if (!tag) {
            tag = await this.tagGetterRepository.tagsGetBySlug(id);
        }
        return tag;
    }
}
