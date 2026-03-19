import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Kysely } from 'kysely';
import { KEYSELY_DB } from '../database/database.module';
import { type LoginRequest, type AuthSession } from '@ifretes/contracts';
import { HalaiService } from './halai.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly halaiService: HalaiService,
    @Inject(KEYSELY_DB) private readonly db: Kysely<any>,
  ) {}

  async validateUser(loginRequest: LoginRequest): Promise<AuthSession> {
    const { username, password } = loginRequest;

    // 1. Tentar Login Remoto (SSO)
    this.logger.log(`Attempting remote login for ${username}`);
    const remoteResponse = await this.halaiService.login(username, password);

    if (remoteResponse.ok) {
      this.logger.log(`Remote login OK. Syncing user ${username} to local database.`);
      return await this.syncUserFromApi(username, remoteResponse);
    }

    // 2. Fallback para Login Local (se o remoto falhar por algo que não seja credencial inválida)
    this.logger.warn(`Remote login failed (${remoteResponse.error}). Falling back to local database.`);
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      // Tentar por email também
      const userByEmail = await this.db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', username)
        .executeTakeFirst();
        
      if (!userByEmail) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      const isPasswordValid = await bcrypt.compare(password, userByEmail.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      return {
        id: String(userByEmail.id),
        username: userByEmail.username,
        role: 'admin',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      id: String(user.id),
      username: user.username,
      role: 'admin',
    };
  }

  private async syncUserFromApi(username: string, remote: any): Promise<AuthSession> {
    try {
      // Upsert local user
      let user = await this.db
        .selectFrom('users')
        .selectAll()
        .where('username', '=', username)
        .executeTakeFirst();

      const updateData: any = {
        username,
        last_login_at: new Date(),
        auth_source: 'halai_api',
        api_token: remote.token,
        api_company_id: remote.company_id,
        api_level: remote.level,
        api_token_expires_at: remote.expires_in ? new Date(Date.now() + remote.expires_in * 1000) : null,
      };

      if (!user) {
        this.logger.log(`Creating new local user from remote sync: ${username}`);
        const result = await this.db
          .insertInto('users')
          .values({
            ...updateData,
            name: username, // Default name
            email: `${username}@halai.api`, // Placeholder email
            password: await bcrypt.hash(Math.random().toString(36), 10), // Random locked password
            preferred_locale: 'pt_BR',
            created_at: new Date(),
            updated_at: new Date(),
          })
          .executeTakeFirst();
        
        const insertId = result.insertId;
        this.logger.log(`User created. Local ID: ${insertId}`);
        return {
          id: String(insertId),
          username,
          role: remote.level === 'super' ? 'superadmin' : 'admin', 
          apiToken: remote.token,
          companyId: remote.company_id,
          level: remote.level,
        };
      } else {
        this.logger.log(`Updating existing local user ID: ${user.id}`);
        await this.db
          .updateTable('users')
          .set(updateData)
          .where('id', '=', user.id)
          .execute();
      }

      this.logger.log(`Sync completed for ${username}.`);
      return {
        id: String(user?.id || 'new'), // 'new' case handled above
        username,
        role: 'admin',
        apiToken: remote.token,
        companyId: remote.company_id,
        level: remote.level,
      };
    } catch (err: any) {
      this.logger.error(`Sync failed for ${username}: ${err.message}`, err.stack);
      throw err;
    }
  }

  async login(user: AuthSession) {
    return {
      access_token: this.jwtService.sign(user),
      user,
    };
  }
}
