import { IUserProps } from "../../../models/iUserProps";

export type ILoginResponse = {
    token: string;
    user: Omit<IUserProps, 'password' | 'createdAt' | 'updatedAt'>;
}

export default interface LoginService {
    login(email: string, password: string): Promise<ILoginResponse | null>;
}
