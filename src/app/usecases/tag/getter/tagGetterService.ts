import type { ITagProps } from "../../../models/iTagProps";

export default interface TagGetterService {
    getAll(): Promise<ITagProps[]>;
    getById(id: string): Promise<ITagProps | null>;
}
