export interface ITagProps {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type ITagCreateData = Omit<ITagProps, "id" | "createdAt" | "updatedAt">;
