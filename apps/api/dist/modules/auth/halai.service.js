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
var HalaiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HalaiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
let HalaiService = HalaiService_1 = class HalaiService {
    configService;
    logger = new common_1.Logger(HalaiService_1.name);
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = this.configService.get('HALAI_API_URL', 'https://halaiapi.cwiz.com.br');
    }
    async login(username, passwordPlain) {
        const passwordHash = (0, node_crypto_1.createHash)('sha256').update(passwordPlain).digest('hex');
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
            const data = await response.json();
            this.logger.log(`HalAI Login successful for user: ${username}`);
            return data;
        }
        catch (err) {
            this.logger.error(`HalAI Login exception: ${err.message}`, err.stack);
            return { ok: false, error: `Connection failed: ${err.message}` };
        }
    }
};
exports.HalaiService = HalaiService;
exports.HalaiService = HalaiService = HalaiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HalaiService);
//# sourceMappingURL=halai.service.js.map