export default interface TagDeleterService {
    delete(id: string): Promise<boolean>;
}
