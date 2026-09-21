import { UserCreatorRepository } from "../../../repositories/user/userCreatorRepository";
import { UserGetterRepository } from "../../../repositories/user/userGetterRepository";
import type { IUserProps, IUserPermission } from "../../../models/iUserProps";
import type { IUserCreateData } from "../../../models/iUserCreateData";
import type UserCreatorService from "./userCreatorService";
import bcrypt from "bcrypt";

export default class UserCreatorServiceImpl implements UserCreatorService {
    private userCreatorRepository: UserCreatorRepository;
    private userGetterRepository: UserGetterRepository;

    public constructor() {
        this.userCreatorRepository = new UserCreatorRepository();
        this.userGetterRepository = new UserGetterRepository();
    }

    public async create(data: IUserCreateData & { permissions?: IUserPermission[] }): Promise<IUserProps | null> {
        const existing = await this.userGetterRepository.usersGetByEmail(data.email);
        if (existing) {
            throw new Error("Já existe um usuário cadastrado com este e-mail.");
        }

        const passwordHash = await bcrypt.hash(data.password!, 10);

        return await this.userCreatorRepository.createUser({
            ...data,
            password: passwordHash,
        });
    }
}
