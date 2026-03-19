import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

export interface HalaiLoginResponse {
  ok: boolean;
  token?: string;
  company_id?: number;
  level?: string;
  expires_in?: number;
  error?: string;
}

@Injectable()
export class HalaiService {
  private readonly logger = new Logger(HalaiService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('HALAI_API_URL', 'https://halaiapi.cwiz.com.br');
  }

  async login(username: string, passwordPlain: string): Promise<HalaiLoginResponse> {
    const passwordHash = createHash('sha256').update(passwordPlain).digest('hex');

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          password_sha256: passwordHash,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`HalAI Login failed: ${response.status} - ${text}`);
        return { ok: false, error: `Remote API returned ${response.status}` };
      }

      const data = await response.json() as HalaiLoginResponse;
      this.logger.log(`HalAI Login successful for user: ${username}`);
      return data;
    } catch (err: any) {
      this.logger.error(`HalAI Login exception: ${err.message}`, err.stack);
      return { ok: false, error: `Connection failed: ${err.message}` };
    }
  }
}
