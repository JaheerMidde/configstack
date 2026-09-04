'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useEffect } from 'react';
import { useConfiguratorStore } from '@/features/configurator/store';

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    useConfiguratorStore.persist.rehydrate();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
