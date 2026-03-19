import { ConfigService } from '@nestjs/config';
export interface HalaiLoginResponse {
    ok: boolean;
    token?: string;
    company_id?: number;
    level?: string;
    expires_in?: number;
    error?: string;
}
export declare class HalaiService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    login(username: string, passwordPlain: string): Promise<HalaiLoginResponse>;
}
