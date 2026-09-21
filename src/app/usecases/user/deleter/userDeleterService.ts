export default interface UserDeleterService {
    delete(id: string): Promise<boolean>;
}
