import type { IPostProps } from "../../../models/iPostProps";
import type { IFindPostsFilters, IPaginatedPostsResult } from "../../../repositories/post/postGetterRepository";

export default interface PostGetterService {
    getAll(filters?: IFindPostsFilters): Promise<IPaginatedPostsResult>;
    getById(id: string): Promise<IPostProps | null>;
}