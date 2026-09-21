import type { ITagProps, ITagCreateData } from "../../../models/iTagProps";

export default interface TagUpdaterService {
    update(id: string, data: Partial<ITagCreateData>): Promise<ITagProps | null>;
}
