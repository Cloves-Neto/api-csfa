import type { ITagProps, ITagCreateData } from "../../../models/iTagProps";

export default interface TagCreatorService {
    create(data: ITagCreateData): Promise<ITagProps | null>;
}
