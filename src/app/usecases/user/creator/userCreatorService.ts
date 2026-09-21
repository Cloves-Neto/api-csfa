import type { IUserProps, IUserPermission } from "../../../models/iUserProps";
import type { IUserCreateData } from "../../../models/iUserCreateData";

export default interface UserCreatorService {
    create(data: IUserCreateData & { permissions?: IUserPermission[] }): Promise<IUserProps | null>;
}
