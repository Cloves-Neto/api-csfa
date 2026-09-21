import { UserUpdaterRepository } from "../../../repositories/user/userUpdaterRepository";
import { UserGetterRepository } from "../../../repositories/user/userGetterRepository";
import type { IUserProps, UserStatus, IUserPermission } from "../../../models/iUserProps";
import type { IUserCreateData } from "../../../models/iUserCreateData";
import type UserUpdaterService from "./userUpdaterService";
import bcrypt from "bcrypt";

export default class UserUpdaterServiceImpl implements UserUpdaterService {
    private userUpdaterRepository: UserUpdaterRepository;
    private userGetterRepository: UserGetterRepository;

    public constructor() {
        this.userUpdaterRepository = new UserUpdaterRepository();
        this.userGetterRepository = new UserGetterRepository();
    }

    public async update(id: string, data: Partial<IUserCreateData> & { permissions?: IUserPermission[] }): Promise<IUserProps | null> {
        const existing = await this.userGetterRepository.usersGetById(id);
        if (!existing) {
            throw new Error("Usuário não encontrado.");
        }

        let passwordHash: string | undefined;
        if (data.password && typeof data.password === "string" && data.password.trim().length > 0) {
            passwordHash = await bcrypt.hash(data.password, 10);
        }

        const updatePayload: any = {
            ...data,
        };
        if (passwordHash) {
            updatePayload.password = passwordHash;
        } else {
            delete updatePayload.password;
        }

        return await this.userUpdaterRepository.updateUser(id, updatePayload);
    }

    public async updateStatus(id: string, status: UserStatus): Promise<boolean> {
        return await this.userUpdaterRepository.updateUserStatus(id, status);
    }
}
