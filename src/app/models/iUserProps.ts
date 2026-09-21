export type UserRole = "PROFESSOR" | "TI" | "COORDENACAO" | "SECRETARIA" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type AccessSchedule = "FULL" | "BUSINESS_HOURS" | "WEEKDAYS";

export interface IUserPermission {
    id?: string;
    userId?: string;
    moduleKey: string;
    level: "full" | "view" | "none" | string;
}

export interface IUserProps {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
    accessSchedule: AccessSchedule;
    imageUrl?: string | null;
    emailVerifiedAt?: Date | null;
    permissions?: IUserPermission[];
    coordinatorId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
