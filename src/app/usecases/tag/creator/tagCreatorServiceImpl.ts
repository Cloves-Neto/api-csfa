import { TagCreatorRepository } from "../../../repositories/tag/tagCreatorRepository";
import { TagGetterRepository } from "../../../repositories/tag/tagGetterRepository";
import type { ITagProps, ITagCreateData } from "../../../models/iTagProps";
import type TagCreatorService from "./tagCreatorService";

export default class TagCreatorServiceImpl implements TagCreatorService {
    private tagCreatorRepository: TagCreatorRepository;
    private tagGetterRepository: TagGetterRepository;

    public constructor() {
        this.tagCreatorRepository = new TagCreatorRepository();
        this.tagGetterRepository = new TagGetterRepository();
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }

    public async create(data: ITagCreateData): Promise<ITagProps | null> {
        let slug = data.slug && data.slug.trim().length > 0 ? data.slug : this.generateSlug(data.name);

        const existing = await this.tagGetterRepository.tagsGetBySlug(slug);
        if (existing) {
            throw new Error("Já existe uma tag com este nome/slug.");
        }

        return await this.tagCreatorRepository.createTag({
            ...data,
            slug,
        });
    }
}
