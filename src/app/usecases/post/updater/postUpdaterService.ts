import type { IPostProps } from "../../../models/iPostProps";
import type { IUpdatePostData } from "../../../repositories/post/postUpdaterRepository";

export default interface PostUpdaterService {
    update(id: string, data: IUpdatePostData): Promise<IPostProps | null>;
    togglePublish(id: string): Promise<IPostProps | null>;
}
