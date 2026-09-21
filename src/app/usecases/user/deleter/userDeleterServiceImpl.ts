import { UserDeleterRepository } from "../../../repositories/user/userDeleterRepository";
import type UserDeleterService from "./userDeleterService";

export default class UserDeleterServiceImpl implements UserDeleterService {
    private userDeleterRepository: UserDeleterRepository;

    public constructor() {
        this.userDeleterRepository = new UserDeleterRepository();
    }

    public async delete(id: string): Promise<boolean> {
        return await this.userDeleterRepository.deleteUser(id);
    }
}
