"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.KEYSELY_DB = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kysely_1 = require("kysely");
const mysql2_1 = require("mysql2");
exports.KEYSELY_DB = 'KYSLEY_DB';
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: exports.KEYSELY_DB,
                useFactory: (configService) => {
                    const host = configService.get('DB_HOST', '127.0.0.1');
                    const port = Number(configService.get('DB_PORT', 3309));
                    const pool = (0, mysql2_1.createPool)({
                        host,
                        port,
                        database: configService.get('DB_DATABASE', 'halaidb'),
                        user: configService.get('DB_USERNAME', 'root'),
                        password: configService.get('DB_PASSWORD', 'password'),
                        connectionLimit: 10,
                    });
                    const dialect = new kysely_1.MysqlDialect({ pool: pool });
                    return new kysely_1.Kysely({ dialect });
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [exports.KEYSELY_DB],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map