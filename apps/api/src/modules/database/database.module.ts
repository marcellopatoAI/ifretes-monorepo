import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';

export const KEYSELY_DB = 'KYSLEY_DB';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KEYSELY_DB,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST', '127.0.0.1');
        const port = Number(configService.get<string | number>('DB_PORT', 3309));

        const pool = createPool({
          host,
          port,
          database: configService.get<string>('DB_DATABASE', 'halaidb'),
          user: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', 'password'),
          connectionLimit: 10,
        });

        const dialect = new MysqlDialect({ pool: pool as any });

        return new Kysely<any>({ dialect });
      },
      inject: [ConfigService],
    },
  ],
  exports: [KEYSELY_DB],
})
export class DatabaseModule {}
