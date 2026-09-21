import PrismaSinglentonConnection from "../../../infrastructure/database/prisma/prismaSinglentonConnecion";
import type { ITagProps } from "../../models/iTagProps";

export class TagGetterRepository {
    private readonly prisma = PrismaSinglentonConnection.getConnection();

    public async tagsGetAll(): Promise<ITagProps[]> {
        try {
            const tags = await this.prisma.tag.findMany({
                orderBy: { name: "asc" },
            });
            return tags as unknown as ITagProps[];
        } catch (e) {
            console.error(`Erro ao listar tags: ${e}`);
            return [];
        }
    }

    public async tagsGetById(id: string): Promise<ITagProps | null> {
        try {
            const tag = await this.prisma.tag.findUnique({
                where: { id },
            });
            return (tag as unknown as ITagProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar tag por id: ${e}`);
            return null;
        }
    }

    public async tagsGetBySlug(slug: string): Promise<ITagProps | null> {
        try {
            const tag = await this.prisma.tag.findUnique({
                where: { slug },
            });
            return (tag as unknown as ITagProps) || null;
        } catch (e) {
            console.error(`Erro ao buscar tag por slug: ${e}`);
            return null;
        }
    }
}
