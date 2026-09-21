import { BannerGetterRepository } from "../../../repositories/banner/bannerGetterRepository";
import type { IBannerProps } from "../../../models/iBannerProps";
import type BannerGetterService from "./bannerGetterService";

export default class BannerGetterServiceImpl implements BannerGetterService {
    private bannerGetterRepository: BannerGetterRepository;

    public constructor() {
        this.bannerGetterRepository = new BannerGetterRepository();
    }

    public async getAll(filters?: { isActive?: boolean }): Promise<IBannerProps[]> {
        return await this.bannerGetterRepository.bannersGetAll(filters);
    }

    public async getById(id: string): Promise<IBannerProps | null> {
        return await this.bannerGetterRepository.bannersGetById(id);
    }
}
