import { BannerDeleterRepository } from "../../../repositories/banner/bannerDeleterRepository";
import type BannerDeleterService from "./bannerDeleterService";

export default class BannerDeleterServiceImpl implements BannerDeleterService {
    private bannerDeleterRepository: BannerDeleterRepository;

    public constructor() {
        this.bannerDeleterRepository = new BannerDeleterRepository();
    }

    public async delete(id: string): Promise<boolean> {
        return await this.bannerDeleterRepository.deleteBanner(id);
    }
}
