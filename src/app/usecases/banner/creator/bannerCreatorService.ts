import type { IBannerProps, IBannerCreateData } from "../../../models/iBannerProps";

export default interface BannerCreatorService {
    create(data: IBannerCreateData): Promise<IBannerProps | null>;
}
