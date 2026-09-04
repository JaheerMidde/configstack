import { z } from 'zod';

export const deviceTypeSchema = z.enum(['PHONE', 'WATCH', 'TABLET']);
export type DeviceType = z.infer<typeof deviceTypeSchema>;

export const selectionSchema = z.object({
    variantId: z.string().optional(),
    planId: z.string().optional(),
    numberShare: z.boolean().optional(),
});
export type Selection = z.infer<typeof selectionSchema>;

export const deviceContextSchema = z.object({
    id: z.string(),
    deviceType: deviceTypeSchema,
    stackOrder: z.number().int().nonnegative(),
    selections: selectionSchema,
});
export type DeviceContext = z.infer<typeof deviceContextStack>;
