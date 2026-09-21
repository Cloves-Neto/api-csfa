import type { IBannerProps, IBannerCreateData } from "../../../models/iBannerProps";

export default interface BannerUpdaterService {
    update(id: string, data: Partial<IBannerCreateData>): Promise<IBannerProps | null>;
    toggleStatus(id: string): Promise<IBannerProps | null>;
}
