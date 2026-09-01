import type { CatalogPlan, CatalogProduct } from '@configstack/shared-types';

/**
 * Public catalog fixtures for the frontend-only demo.
 * 
 * The IDs are stable so locally saved sessions and receipts remain readable
 * after a refresh. A production app would replace this repository with a server
 * or CMS-backed catalog.
 */
export const catalogProducts: CatalogProduct[] = [
    {
        id: 'product-galaxy-phone',
        slug: 'galaxy-phone',
        name: 'Galaxy Phone Pro',
        category: 'PHONE',
        variants: [
            { id: 'variant-phone-128', sku: 'PHONE-128', name: '128GB', variantType: 'STORAGE', priceCents: 79900 },
            { id: 'variant-phone-256', sku: 'PHONE-256', name: '256GB', variantType: 'STORAGE', priceCents: 89900 },
            { id: 'variant-phone-512', sku: 'PHONE-512', name: '512GB', variantType: 'STORAGE', priceCents: 109900 },
        ],
    },
    {
        id: 'product-smart-watch',
        slug: 'smart-watch',
        name: 'Smart Watch Series X',
        category: 'WATCH',
        variants: [
            { id: 'variant-watch-sport', sku: 'WATCH-SPORT', name: 'Sport Band', variantType: 'BAND', priceCents: 39900 },
            { id: 'variant-watch-leather', sku: 'WATCH-LEATHER', name: 'Leather Band', variantType: 'BAND', priceCents: 44900 },
            { id: 'variant-watch-metal', sku: 'WATCH-METAL', name: 'Metal Band', variantType: 'BAND', priceCents: 49900 },
        ],
    },
    {
        id: 'product-pro-tablet',
        slug: 'pro-tablet',
        name: 'Pro Tablet Air',
        category: 'TABLET',
        variants: [
            { id: 'variant-tablet-64', sku: 'TABLET-64', name: '64GB Wi-Fi', variantType: 'STORAGE', priceCents: 49900 },
            { id: 'variant-tablet-256', sku: 'TABLET-256', name: '256GB Wi-Fi', variantType: 'STORAGE', priceCents: 64900 },
            { id: 'variant-tablet-512', sku: 'TABLET-512', name: '512GB Wi-Fi + Cellular', variantType: 'STORAGE', priceCents: 89900 },
        ],
    },
];

export const catalogPlans: CatalogPlan[] = [
    {
        id: 'plan-basic',
        slug: 'basic',
        name: 'Basic Line',
        tier: 'BASIC',
        monthlyPriceCents: 4500,
        supportsNumberShare: false,
        features: ['5GB data', 'Unlimited talk & text'],
    },
    {
        id: 'plan-plus',
        slug: 'plus',
        name: 'Plus Line',
        tier: 'PLUS',
        monthlyPriceCents: 6500,
        supportsNumberShare: false,
        features: ['15GB data', 'HD streaming', 'Mobile Hotspot'],
    },
    {
        id: 'plan-premium',
        slug: 'premium',
        name: 'Premium Line',
        tier: 'PREMIUM',
        monthlyPriceCents: 8500,
        supportsNumberShare: true,
        features: ['50GB data', 'Number Share eligible', 'Premium streaming'],
    },
    {
        id: 'plan-unlimited',
        slug: 'unlimited',
        name: 'Unlimited Max',
        tier: 'UNLIMITED',
        monthlyPriceCents: 10500,
        supportsNumberShare: true,
        features: ['Unlimited data', 'Number Share eligible', 'International roaming'],
    },
];

export function getCatalogProducts(): CatalogProduct[] {
    return catalogProducts.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({ ...variant })),
    }));
}

export function getCatalogPlans(): CatalogPlan[] {
    return catalogPlans.map((plan) => ({
        ...plan,
        features: [...plan.features],
    }));
}