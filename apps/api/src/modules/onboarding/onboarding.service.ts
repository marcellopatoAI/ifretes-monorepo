import { Injectable, Inject, Logger } from '@nestjs/common';
import { KEYSELY_DB } from '../database/database.module';
import { Kysely } from 'kysely';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(@Inject(KEYSELY_DB) private readonly db: Kysely<any>) {}

  async checkCnpj(cnpj: string) {
    this.logger.log(`Checking CNPJ: ${cnpj}`);
    // Mock validation logic similar to Hal-AI Zap
    const isApproved = cnpj.startsWith('123') || cnpj.length === 14; 
    
    if (!isApproved) {
        return { ok: false, error: 'Este CNPJ não está liberado para contratação nesta fase.' };
    }

    return { 
        ok: true, 
        data: { 
            razaoSocial: 'Transportadora de Teste LTDA',
            status: 'allowed'
        } 
    };
  }
}
