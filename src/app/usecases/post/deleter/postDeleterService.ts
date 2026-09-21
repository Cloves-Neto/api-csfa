export default interface PostDeleterService {
    delete(id: string): Promise<boolean>;
}
