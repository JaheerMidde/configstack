'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createOrder,
  createSession,
  fetchHealth,
  fetchOrder,
  fetchSession,
  healthKey,
  orderKey,
  sessionKey
} from '@/features/configurator/queries';
import type { OrderCreateInput } from '@/lib/schemas/order';
import type { SessionPayload } from '@/lib/schemas/session';

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKey(),
    queryFn: fetchHealth,
  });
}

export function useSessionQuery(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKey(sessionId ?? ''),
    queryFn: () => fetchSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useCreateSessionMutation() {
  return useMutation({
    mutationFn: (payload: SessionPayload) => createSession(payload),
  });
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: OrderCreateInput; idempotencyKey: string }) =>
      createOrder(payload, idempotencyKey),
  });
}

export function useOrderQuery(orderId: string | null) {
  return useQuery({
    queryKey: orderKey(orderId ?? ''),
    queryFn: () => fetchOrder(orderId!),
    enabled: Boolean(orderId),
    retry: false,
  });
}
