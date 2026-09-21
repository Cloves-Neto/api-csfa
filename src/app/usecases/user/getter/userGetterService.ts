import type { IUserProps } from "../../../models/iUserProps";
import type { IFindUsersFilters, IPaginatedUsersResult } from "../../../repositories/user/userGetterRepository";

export default interface UserGetterService {
    getAll(filters?: IFindUsersFilters): Promise<IPaginatedUsersResult>;
    getById(id: string): Promise<IUserProps | null>;
}
