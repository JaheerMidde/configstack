import { z } from 'zod';
import { deviceContextSchema } from './device';

export const orderCreateInputSchema = z.object({
  deviceContextStack: z.array(deviceContextSchema).min(1),
  sessionId: z.string().optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateInputSchema>;

export const orderCreateResponseSchema = z.object({
  orderId: z.string(),
  hardwareCents: z.number(),
  monthlyCents: z.number(),
  deviceCount: z.number(),
  replayed: z.boolean().optional(),
});

export type OrderCreateResponse = z.infer<typeof orderCreateResponseSchema>;

export const orderConfirmationSchema = z.object({
  orderId: z.string(),
  status: z.string(),
  hardwareCents: z.number(),
  monthlyCents: z.number(),
  deviceCount: z.number(),
  createdAt: z.string(),
});

export type OrderConfirmation = z.infer<typeof orderConfirmationSchema>;

export class OrderValidationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: { code: string; deviceId?: string; message: string }[],
  ) {
    super(message);
    this.name = 'OrderValidationError';
  }
}
