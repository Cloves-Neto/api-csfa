import { UserGetterRepository, type IFindUsersFilters, type IPaginatedUsersResult } from "../../../repositories/user/userGetterRepository";
import type { IUserProps } from "../../../models/iUserProps";
import type UserGetterService from "./userGetterService";

export default class UserGetterServiceImpl implements UserGetterService {
    private userGetterRepository: UserGetterRepository;

    public constructor() {
        this.userGetterRepository = new UserGetterRepository();
    }

    public async getAll(filters: IFindUsersFilters = {}): Promise<IPaginatedUsersResult> {
        return await this.userGetterRepository.usersGetAll(filters);
    }

    public async getById(id: string): Promise<IUserProps | null> {
        return await this.userGetterRepository.usersGetById(id);
    }
}
