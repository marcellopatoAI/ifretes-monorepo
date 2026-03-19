import { JwtService } from '@nestjs/jwt';
import { Kysely } from 'kysely';
import { type LoginRequest, type AuthSession } from '@ifretes/contracts';
import { HalaiService } from './halai.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly halaiService;
    private readonly db;
    private readonly logger;
    constructor(jwtService: JwtService, halaiService: HalaiService, db: Kysely<any>);
    validateUser(loginRequest: LoginRequest): Promise<AuthSession>;
    private syncUserFromApi;
    login(user: AuthSession): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            role: "superadmin" | "admin" | "user" | "manager" | "driver" | "chapa";
            transportadoraId?: number | undefined;
            apiToken?: string | undefined;
            companyId?: number | undefined;
            level?: string | undefined;
        };
    }>;
}
