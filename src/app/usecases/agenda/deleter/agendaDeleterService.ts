export default interface AgendaDeleterService {
    delete(id: string): Promise<boolean>;
}
