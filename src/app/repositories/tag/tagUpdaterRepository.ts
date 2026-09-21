import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { ITagProps, ITagCreateData } from "../../models/iTagProps";

export class TagUpdaterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async updateTag(id: string, data: Partial<ITagCreateData>): Promise<ITagProps | null> {
        try {
            const updateData: any = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.slug !== undefined) updateData.slug = data.slug;
            if (data.color !== undefined) updateData.color = data.color;

            const tag = await this.prisma.tag.update({
                where: { id },
                data: updateData,
            });
            return tag as unknown as ITagProps;
        } catch (e) {
            console.error(`Erro ao atualizar tag: ${e}`);
            return null;
        }
    }
}
