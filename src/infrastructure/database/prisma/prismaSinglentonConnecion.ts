import { PrismaClient } from "@prisma/client";

export default class PrismaSinglentonConnection {
    private static instance: PrismaClient;

    private constructor() {}

    public static getConnection(): PrismaClient {
        if (!PrismaSinglentonConnection.instance) {
            PrismaSinglentonConnection.instance = new PrismaClient();
        }
        return PrismaSinglentonConnection.instance;
    }
}