export default interface BannerDeleterService {
    delete(id: string): Promise<boolean>;
}
