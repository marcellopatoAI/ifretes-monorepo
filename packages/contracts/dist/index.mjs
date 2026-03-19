// src/index.ts
import { z } from "zod";
var AuthSessionSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(["superadmin", "admin", "user", "manager", "driver", "chapa"]),
  transportadoraId: z.number().optional(),
  apiToken: z.string().optional(),
  companyId: z.number().optional(),
  level: z.string().optional()
});
var LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(3)
});
var EnvelopeSchema = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  meta: z.record(z.any()).optional()
});
export {
  AuthSessionSchema,
  EnvelopeSchema,
  LoginRequestSchema
};
