export default interface VerifyEmailService {
    verifyEmail(token: string): Promise<boolean>;
}
