import { z } from 'zod';

declare const AuthSessionSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    role: z.ZodEnum<["superadmin", "admin", "user", "manager", "driver", "chapa"]>;
    transportadoraId: z.ZodOptional<z.ZodNumber>;
    apiToken: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodNumber>;
    level: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    username: string;
    role: "superadmin" | "admin" | "user" | "manager" | "driver" | "chapa";
    transportadoraId?: number | undefined;
    apiToken?: string | undefined;
    companyId?: number | undefined;
    level?: string | undefined;
}, {
    id: string;
    username: string;
    role: "superadmin" | "admin" | "user" | "manager" | "driver" | "chapa";
    transportadoraId?: number | undefined;
    apiToken?: string | undefined;
    companyId?: number | undefined;
    level?: string | undefined;
}>;
type AuthSession = z.infer<typeof AuthSessionSchema>;
declare const LoginRequestSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
type LoginRequest = z.infer<typeof LoginRequestSchema>;
declare const EnvelopeSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    data?: any;
    error?: string | undefined;
    meta?: Record<string, any> | undefined;
}, {
    ok: boolean;
    data?: any;
    error?: string | undefined;
    meta?: Record<string, any> | undefined;
}>;
type Envelope<T = any> = {
    ok: boolean;
    data?: T;
    error?: string;
    meta?: Record<string, any>;
};

export { type AuthSession, AuthSessionSchema, type Envelope, EnvelopeSchema, type LoginRequest, LoginRequestSchema };
