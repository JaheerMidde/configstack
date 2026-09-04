import type { DeviceContext } from '@/lib/schemas/device';

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: DeviceContext['deviceType'];
  variants: {
    id: string;
    sku: string;
    name: string;
    variantType: string;
    priceCents: number;
  }[];
};

export type CatalogPlan = {
  id: string;
  slug: string;
  name: string;
  tier: string;
  monthlyPriceCents: number;
  supportsNumberShare: boolean;
  features: string[];
};

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function deviceLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function deviceDotClass(type: string): string {
  switch (type) {
    case 'PHONE':
      return 'device-dot device-dot-phone';
    case 'WATCH':
      return 'device-dot device-dot-watch';
    case 'TABLET':
      return 'device-dot device-dot-tablet';
    default:
      return 'device-dot bg-slate-400';
  }
}

export function deviceBgClass(type: string): string {
  switch (type) {
    case 'PHONE':
      return 'bg-device-phone';
    case 'WATCH':
      return 'bg-device-watch';
    case 'TABLET':
      return 'bg-device-tablet';
    default:
      return 'bg-slate-400';
  }
}

export function deviceAccentBorder(type: string): string {
  switch (type) {
    case 'PHONE':
      return 'border-l-device-phone';
    case 'WATCH':
      return 'border-l-device-watch';
    case 'TABLET':
      return 'border-l-device-tablet';
    default:
      return 'border-l-slate-300';
  }
}

export function deviceTextClass(type: string): string {
  switch (type) {
    case 'PHONE':
      return 'text-device-phone';
    case 'WATCH':
      return 'text-device-watch';
    case 'TABLET':
      return 'text-device-tablet';
    default:
      return 'text-slate-600';
  }
}

export type StackTotals = {
  deviceCount: number;
  hardwareCents: number;
  monthlyCents: number;
  dueTodayCents: number;
};

export function computeStackTotals(
  stack: DeviceContext[],
  products: CatalogProduct[],
  plans: CatalogPlan[],
): StackTotals {
  let hardwareCents = 0;
  let monthlyCents = 0;

  for (const device of stack) {
    const product = products.find((p) => p.category === device.deviceType);
    const variant = product?.variants.find((v) => v.id === device.selections.variantId);
    const plan = plans.find((p) => p.id === device.selections.planId);

    if (variant) hardwareCents += variant.priceCents;
    if (plan) monthlyCents += plan.monthlyPriceCents;
  }

  return {
    deviceCount: stack.length,
    hardwareCents,
    monthlyCents,
    dueTodayCents: hardwareCents,
  };
}
