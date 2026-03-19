"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const kysely_1 = require("kysely");
const database_module_1 = require("../database/database.module");
const halai_service_1 = require("./halai.service");
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    halaiService;
    db;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(jwtService, halaiService, db) {
        this.jwtService = jwtService;
        this.halaiService = halaiService;
        this.db = db;
    }
    async validateUser(loginRequest) {
        const { username, password } = loginRequest;
        this.logger.log(`Attempting remote login for ${username}`);
        const remoteResponse = await this.halaiService.login(username, password);
        if (remoteResponse.ok) {
            this.logger.log(`Remote login OK. Syncing user ${username} to local database.`);
            return await this.syncUserFromApi(username, remoteResponse);
        }
        this.logger.warn(`Remote login failed (${remoteResponse.error}). Falling back to local database.`);
        const user = await this.db
            .selectFrom('users')
            .selectAll()
            .where('username', '=', username)
            .executeTakeFirst();
        if (!user) {
            const userByEmail = await this.db
                .selectFrom('users')
                .selectAll()
                .where('email', '=', username)
                .executeTakeFirst();
            if (!userByEmail) {
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, userByEmail.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            return {
                id: String(userByEmail.id),
                username: userByEmail.username,
                role: 'admin',
            };
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        return {
            id: String(user.id),
            username: user.username,
            role: 'admin',
        };
    }
    async syncUserFromApi(username, remote) {
        try {
            let user = await this.db
                .selectFrom('users')
                .selectAll()
                .where('username', '=', username)
                .executeTakeFirst();
            const updateData = {
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
                    name: username,
                    email: `${username}@halai.api`,
                    password: await bcryptjs_1.default.hash(Math.random().toString(36), 10),
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
            }
            else {
                this.logger.log(`Updating existing local user ID: ${user.id}`);
                await this.db
                    .updateTable('users')
                    .set(updateData)
                    .where('id', '=', user.id)
                    .execute();
            }
            this.logger.log(`Sync completed for ${username}.`);
            return {
                id: String(user?.id || 'new'),
                username,
                role: 'admin',
                apiToken: remote.token,
                companyId: remote.company_id,
                level: remote.level,
            };
        }
        catch (err) {
            this.logger.error(`Sync failed for ${username}: ${err.message}`, err.stack);
            throw err;
        }
    }
    async login(user) {
        return {
            access_token: this.jwtService.sign(user),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(database_module_1.KEYSELY_DB)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        halai_service_1.HalaiService,
        kysely_1.Kysely])
], AuthService);
//# sourceMappingURL=auth.service.js.map