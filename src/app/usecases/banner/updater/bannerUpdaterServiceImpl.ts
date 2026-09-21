import { BannerUpdaterRepository } from "../../../repositories/banner/bannerUpdaterRepository";
import { BannerGetterRepository } from "../../../repositories/banner/bannerGetterRepository";
import type { IBannerProps, IBannerCreateData } from "../../../models/iBannerProps";
import type BannerUpdaterService from "./bannerUpdaterService";

export default class BannerUpdaterServiceImpl implements BannerUpdaterService {
    private bannerUpdaterRepository: BannerUpdaterRepository;
    private bannerGetterRepository: BannerGetterRepository;

    public constructor() {
        this.bannerUpdaterRepository = new BannerUpdaterRepository();
        this.bannerGetterRepository = new BannerGetterRepository();
    }

    public async update(id: string, data: Partial<IBannerCreateData>): Promise<IBannerProps | null> {
        const existing = await this.bannerGetterRepository.bannersGetById(id);
        if (!existing) {
            throw new Error("Banner não encontrado.");
        }
        return await this.bannerUpdaterRepository.updateBanner(id, data);
    }

    public async toggleStatus(id: string): Promise<IBannerProps | null> {
        const existing = await this.bannerGetterRepository.bannersGetById(id);
        if (!existing) {
            throw new Error("Banner não encontrado.");
        }
        return await this.bannerUpdaterRepository.toggleBannerStatus(id);
    }
}
