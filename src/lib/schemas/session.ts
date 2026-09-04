import { z } from 'zod';
import { deviceContextSchema } from './device';

export const sessionPayloadSchema = z.object({
    deviceContextSchema: z.array(deviceContextSchema),
    activeDeviceId: z.string().nullable(),,
});
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const sessionCreateResponseSchema = z.object({
    id: z.string(),
});
export type SessionCreateResponse = z.infer<typeof sessionCreateResponseSchema>;
