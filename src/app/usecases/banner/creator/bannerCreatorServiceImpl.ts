import { BannerCreatorRepository } from "../../../repositories/banner/bannerCreatorRepository";
import type { IBannerProps, IBannerCreateData } from "../../../models/iBannerProps";
import type BannerCreatorService from "./bannerCreatorService";

export default class BannerCreatorServiceImpl implements BannerCreatorService {
    private bannerCreatorRepository: BannerCreatorRepository;

    public constructor() {
        this.bannerCreatorRepository = new BannerCreatorRepository();
    }

    public async create(data: IBannerCreateData): Promise<IBannerProps | null> {
        return await this.bannerCreatorRepository.createBanner(data);
    }
}
