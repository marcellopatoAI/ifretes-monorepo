import { ConfigService } from '@nestjs/config';
export declare class HalaiService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    testConnection(): Promise<{
        ok: boolean;
        status: string;
    }>;
}
