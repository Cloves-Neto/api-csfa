import type { IUserProps } from "../../../models/iUserProps";
import type { IUserCreateData } from "../../../models/iUserCreateData";

export default interface RegisterService {
    register(data: IUserCreateData): Promise<IUserProps | null>;
}
