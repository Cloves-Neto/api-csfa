export interface IPostTagItem {
    tagId?: string;
    tag: {
        id: string;
        name: string;
        slug: string;
        color?: string | null;
    };
}

export interface IPostProps {
    id: string;
    title: string;
    content: string;
    slug: string;
    excerpt?: string | null;
    coverImageId?: string | null;
    isEvent?: boolean | null;
    authorId: string;
    author?: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email: string;
        imageUrl?: string | null;
    };
    published: boolean;
    tags?: IPostTagItem[];
    createdAt: Date | string;
    updatedAt: Date | string;
    publishedAt?: Date | string | null;
}
