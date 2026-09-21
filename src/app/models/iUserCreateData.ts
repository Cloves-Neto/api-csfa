import type { IUserProps } from "./iUserProps";

export type IUserCreateData = Omit<IUserProps, "id" | "createdAt" | "updatedAt">;
