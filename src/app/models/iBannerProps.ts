export interface IBannerProps {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl?: string | null;
    publishDate?: Date | string | null;
    order: number;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type IBannerCreateData = Omit<IBannerProps, "id" | "createdAt" | "updatedAt">;
