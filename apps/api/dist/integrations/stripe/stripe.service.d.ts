import { ConfigService } from '@nestjs/config';
export declare class StripeService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    testConnection(): Promise<{
        ok: boolean;
        integration: string;
    }>;
}
