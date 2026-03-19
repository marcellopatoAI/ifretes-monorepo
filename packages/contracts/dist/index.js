"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthSessionSchema: () => AuthSessionSchema,
  EnvelopeSchema: () => EnvelopeSchema,
  LoginRequestSchema: () => LoginRequestSchema
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var AuthSessionSchema = import_zod.z.object({
  id: import_zod.z.string(),
  username: import_zod.z.string(),
  role: import_zod.z.enum(["superadmin", "admin", "user", "manager", "driver", "chapa"]),
  transportadoraId: import_zod.z.number().optional(),
  apiToken: import_zod.z.string().optional(),
  companyId: import_zod.z.number().optional(),
  level: import_zod.z.string().optional()
});
var LoginRequestSchema = import_zod.z.object({
  username: import_zod.z.string().min(1),
  password: import_zod.z.string().min(3)
});
var EnvelopeSchema = import_zod.z.object({
  ok: import_zod.z.boolean(),
  data: import_zod.z.any().optional(),
  error: import_zod.z.string().optional(),
  meta: import_zod.z.record(import_zod.z.any()).optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthSessionSchema,
  EnvelopeSchema,
  LoginRequestSchema
});
