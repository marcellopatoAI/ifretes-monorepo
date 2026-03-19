import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HalaiService {
  private readonly logger = new Logger(HalaiService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('HALAI_API_URL', 'https://halaiapi.cwiz.com.br');
  }

  async testConnection() {
    this.logger.log(`Testing connection to HALAI at ${this.baseUrl}`);
    // implementation will be added in Phase 4
    return { ok: true, status: 'mock' };
  }
}
