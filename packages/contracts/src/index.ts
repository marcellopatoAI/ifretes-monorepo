import { z } from 'zod';

export const AuthSessionSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['superadmin', 'admin', 'user', 'manager', 'driver', 'chapa']),
  transportadoraId: z.number().optional(),
  apiToken: z.string().optional(),
  companyId: z.number().optional(),
  level: z.string().optional(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(3),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const EnvelopeSchema = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export type Envelope<T = any> = {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
};
