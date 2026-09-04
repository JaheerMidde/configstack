import { z } from 'zod';

export const validationErrorCodeSchema = z.enum([
    'NUMBER_SHARE_REQUIRES_PHONE',
    'NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN',
    'MISSING_PLAN',
    'MISSING_VARIANT',
    'DUPLICATE_PHONE',
    'INVALID_DEVICE_TYPE',
]);

export const validationErrorSchema = z.object({
    code: validationErrorCodeSchema,
    deviceId: z.string(),
    message: z.string(),
});
export type ValidationError = z.infer<typeof validationErrorSchema>;
