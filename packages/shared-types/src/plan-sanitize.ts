export type PlanTier = 'BASIC' | 'PLUS' | 'PREMIUM' | 'UNLIMITED';

export const SENSITIVE_PLAN_FIELDS = [
    'internalCostCents',
    'marginPercent',
    'eligibilityRuleCode',
    'partnerSubsidyId',
] as const;

export type PlanPublicFields = {
    id: string;
    slug: string;
    name: string;
    tier: PlanTier;
    monthlyPriceCents: number;
    supportsNumberShare: boolean;
    features: string[];
};

/** Pick the public plan contract so internal-only fields never enter client data. */
export function pickPublicPlanFields(plan: PlanPublicFields): PlanPublicFields {
    return {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        tier: plan.tier,
        monthlyPriceCents: plan.monthlyPriceCents,
        supportsNumberShare: plan.supportsNumberShare,
        features: plan.features,
    };
}

export function assertNoSensitivePlanFields(obj: unknown): void {
    const record = obj as Record<string, unknown>;
    for (const key of SENSITIVE_PLAN_FIELDS) {
        if (key in record) {
            throw new Error(`Sensitive field "${key}" must not be exposed to client`);
        }
    }
}