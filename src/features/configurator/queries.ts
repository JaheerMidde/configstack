import { nanoid } from 'nanoid';
import { getCatalogPlans, getCatalogProducts } from '@/features/catalog/data';
import { computeStackTotals } from '@/features/configurator/types';
import {
  OrderValidationError,
  orderConfirmationSchema,
  orderCreateInputSchema,
  type OrderConfirmation,
  type OrderCreateInput,
  type OrderCreateResponse,
} from '@/lib/schemas/order';
import { sessionPayloadSchema, type SessionPayload } from '@/lib/schemas/session';
import type { DeviceContext } from '@configstack/shared-types';
import { validateConfigurationStack } from '@configstack/shared-validation';

export const healthKey = () => ['health'] as const;
export const sessionKey = (id: string) => ['session', id] as const;
export const orderKey = (id: string) => ['order', id] as const;

export type HealthResponse = {
  status: string;
  storage: string;
  catalog: string;
  schemaVersion?: string;
  planCount?: number;
  message?: string;
};

const SESSIONS_STORAGE_KEY = 'configstack:sessions';
const ORDERS_STORAGE_KEY = 'configstack:orders';
const IDEMPOTENCY_STORAGE_KEY = 'configstack:order-idempotency';

type StoredSession = SessionPayload & {
  id: string;
  updatedAt: string;
};

type StoredOrder = OrderConfirmation & {
  idempotencyKey: string;
};

function getLocalStorage(): Storage {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Local storage is unavailable in this environment');
  }

  return window.localStorage;
}

function canUseLocalStorage(): boolean {
  try {
    getLocalStorage();
    return true;
  } catch {
    return false;
  }
}

function readRecord<T>(key: string): Record<string, T> {
  const raw = getLocalStorage().getItem(key);
  if (!raw) return {};

  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === 'object' && value !== null ? (value as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeRecord<T>(key: string, value: Record<string, T>): void {
  getLocalStorage().setItem(key, JSON.stringify(value));
}

function validateActiveDeviceId(activeDeviceId: string | null, stack: DeviceContext[]): void {
  if (activeDeviceId && !stack.some((device) => device.id === activeDeviceId)) {
    throw new Error('activeDeviceId must reference a device in deviceContextStack');
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const storage = canUseLocalStorage() ? 'localStorage' : 'unavailable';

  return {
    status: storage === 'localStorage' ? 'ok' : 'degraded',
    storage,
    catalog: 'static fixtures',
    schemaVersion: 'frontend-demo-v1',
    planCount: getCatalogPlans().length,
    message: 'Catalog and demo checkout run locally in this browser.',
  };
}

export async function fetchSession(id: string): Promise<StoredSession> {
  const session = readRecord<StoredSession>(SESSIONS_STORAGE_KEY)[id];
  if (!session) {
    throw new Error('Session not found in this browser');
  }

  const parsed = sessionPayloadSchema.parse(session);
  return { ...parsed, id, updatedAt: session.updatedAt };
}

export async function createSession(payload: SessionPayload): Promise<{ id: string }> {
  const parsed = sessionPayloadSchema.parse(payload);
  validateActiveDeviceId(parsed.activeDeviceId, parsed.deviceContextStack);

  const id = `session-${nanoid(10)}`;
  const session: StoredSession = {
    ...parsed,
    id,
    updatedAt: new Date().toISOString(),
  };

  const sessions = readRecord<StoredSession>(SESSIONS_STORAGE_KEY);
  writeRecord(SESSIONS_STORAGE_KEY, { ...sessions, [id]: session });

  return { id };
}

export async function createOrder(
  payload: OrderCreateInput,
  idempotencyKey: string,
): Promise<OrderCreateResponse> {
  const parsed = orderCreateInputSchema.parse({ ...payload, idempotencyKey });
  const plans = getCatalogPlans();
  const validationErrors = validateConfigurationStack({
    stack: parsed.deviceContextStack,
    plans: plans.map((plan) => ({
      id: plan.id,
      supportsNumberShare: plan.supportsNumberShare,
    })),
  });

  if (validationErrors.length > 0) {
    throw new OrderValidationError('Configuration validation failed', validationErrors);
  }

  const idempotencyMap = readRecord<string>(IDEMPOTENCY_STORAGE_KEY);
  const existingOrderId = idempotencyMap[idempotencyKey];
  const orders = readRecord<StoredOrder>(ORDERS_STORAGE_KEY);

  if (existingOrderId && orders[existingOrderId]) {
    return toOrderResponse(orders[existingOrderId], true);
  }

  const totals = computeStackTotals(parsed.deviceContextStack, getCatalogProducts(), plans);
  const orderId = `order-${nanoid(10)}`;
  const order: StoredOrder = {
    orderId,
    status: 'CONFIRMED',
    hardwareCents: totals.hardwareCents,
    monthlyCents: totals.monthlyCents,
    deviceCount: totals.deviceCount,
    createdAt: new Date().toISOString(),
    idempotencyKey,
  };

  writeRecord(ORDERS_STORAGE_KEY, { ...orders, [orderId]: order });
  writeRecord(IDEMPOTENCY_STORAGE_KEY, { ...idempotencyMap, [idempotencyKey]: orderId });

  return toOrderResponse(order);
}

export async function fetchOrder(id: string): Promise<OrderConfirmation> {
  const order = readRecord<StoredOrder>(ORDERS_STORAGE_KEY)[id];
  if (!order) {
    throw new Error('Order not found in this browser');
  }

  return orderConfirmationSchema.parse(order);
}

function toOrderResponse(order: StoredOrder, replayed = false): OrderCreateResponse {
  return {
    orderId: order.orderId,
    hardwareCents: order.hardwareCents,
    monthlyCents: order.monthlyCents,
    deviceCount: order.deviceCount,
    ...(replayed ? { replayed: true } : {}),
  };
}
