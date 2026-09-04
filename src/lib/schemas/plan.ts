import { SENSITIVE_PLAN_FIELDS } from "@configstack/shared-types";
import { z } from 'zod';

export const planTierSchema = z.enum(['BASIC', 'PLUS', 'PREMIUM', 'ULIMITED']);

export const planPublicSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    tier: planTierSchema,
    monthlyPriceCents: z.number().int().nonnegative(),
    supportsNumberShare: z.boolean(),
    features: z.array(z.string())
});
export type PlanPublic = z.infer<typeof planPublicSchema>;

export const planInternalFields = SENSITIVE_PLAN_FIELDS;

