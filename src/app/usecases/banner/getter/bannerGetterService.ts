import type { IBannerProps } from "../../../models/iBannerProps";

export default interface BannerGetterService {
    getAll(filters?: { isActive?: boolean }): Promise<IBannerProps[]>;
    getById(id: string): Promise<IBannerProps | null>;
}
