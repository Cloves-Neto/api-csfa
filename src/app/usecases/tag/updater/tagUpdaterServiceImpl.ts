import { TagUpdaterRepository } from "../../../repositories/tag/tagUpdaterRepository";
import { TagGetterRepository } from "../../../repositories/tag/tagGetterRepository";
import type { ITagProps, ITagCreateData } from "../../../models/iTagProps";
import type TagUpdaterService from "./tagUpdaterService";

export default class TagUpdaterServiceImpl implements TagUpdaterService {
    private tagUpdaterRepository: TagUpdaterRepository;
    private tagGetterRepository: TagGetterRepository;

    public constructor() {
        this.tagUpdaterRepository = new TagUpdaterRepository();
        this.tagGetterRepository = new TagGetterRepository();
    }

    public async update(id: string, data: Partial<ITagCreateData>): Promise<ITagProps | null> {
        const existing = await this.tagGetterRepository.tagsGetById(id);
        if (!existing) {
            throw new Error("Tag não encontrada.");
        }
        return await this.tagUpdaterRepository.updateTag(id, data);
    }
}
