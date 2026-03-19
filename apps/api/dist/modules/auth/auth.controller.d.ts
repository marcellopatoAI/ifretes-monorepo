import { AuthService } from './auth.service';
import { type Envelope } from '@ifretes/contracts';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<Envelope>;
    getProfile(req: any): Promise<Envelope>;
}
