import type { IUserProps, UserStatus, IUserPermission } from "../../../models/iUserProps";
import type { IUserCreateData } from "../../../models/iUserCreateData";

export default interface UserUpdaterService {
    update(id: string, data: Partial<IUserCreateData> & { permissions?: IUserPermission[] }): Promise<IUserProps | null>;
    updateStatus(id: string, status: UserStatus): Promise<boolean>;
}
