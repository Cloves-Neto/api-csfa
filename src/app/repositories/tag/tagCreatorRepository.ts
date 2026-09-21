import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { ITagProps, ITagCreateData } from "../../models/iTagProps";

export class TagCreatorRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async createTag(data: ITagCreateData): Promise<ITagProps | null> {
        try {
            const tag = await this.prisma.tag.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    color: data.color ?? "#44abff",
                },
            });
            return tag as unknown as ITagProps;
        } catch (e) {
            console.error(`Erro ao criar tag: ${e}`);
            return null;
        }
    }
}
