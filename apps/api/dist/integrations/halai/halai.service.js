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
let HalaiService = HalaiService_1 = class HalaiService {
    configService;
    logger = new common_1.Logger(HalaiService_1.name);
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = this.configService.get('HALAI_API_URL', 'https://halaiapi.cwiz.com.br');
    }
    async testConnection() {
        this.logger.log(`Testing connection to HALAI at ${this.baseUrl}`);
        return { ok: true, status: 'mock' };
    }
};
exports.HalaiService = HalaiService;
exports.HalaiService = HalaiService = HalaiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HalaiService);
//# sourceMappingURL=halai.service.js.map