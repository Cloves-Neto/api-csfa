export default interface ResetPasswordService {
    requestReset(email: string): Promise<boolean>;
    confirmReset(token: string, newPassword: string): Promise<boolean>;
    adminReset(adminRole: string, targetEmail: string, newPassword: string): Promise<boolean>;
}
