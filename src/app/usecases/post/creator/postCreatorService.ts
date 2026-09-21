import type { IPostProps } from "../../../models/iPostProps";

export interface ICreatePostDTO {
    title: string;
    content: string;
    slug?: string;
    excerpt?: string | null;
    coverImageId?: string | null;
    isEvent?: boolean;
    authorId: string;
    published?: boolean;
    tagIds?: string[];
}

export default interface PostCreatorService {
    create(data: ICreatePostDTO): Promise<IPostProps | null>;
}
