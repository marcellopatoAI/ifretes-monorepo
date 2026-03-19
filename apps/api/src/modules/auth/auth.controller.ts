import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestSchema, type Envelope } from '@ifretes/contracts';
import { type AuthSession } from '@ifretes/contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any): Promise<Envelope> {
    try {
      const loginRequest = LoginRequestSchema.parse(body);
      const user = await this.authService.validateUser(loginRequest);
      const result = await this.authService.login(user);
      return { ok: true, data: result };
    } catch (err: any) {
      return { 
        ok: false, 
        error: err.issues ? 'Dados inválidos: ' + err.issues[0].message : err.message 
      };
    }
  }

  @Get('me')
  async getProfile(@Request() req: any): Promise<Envelope> {
    // Profile logic will be implemented in Phase 1
    return {
      ok: true,
      data: req.user || { guest: true },
    };
  }
}
