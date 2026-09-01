export type DeviceType = 'PHONE' | 'WATCH' | 'TABLET';

export type Selection = {
    variantId?: string;
    planId?: string;
    numberShare?: boolean;
};

export type DeviceContext = {
    id: string;
    deviceType: DeviceType;
    stackOrder: number;
    selections: Selection;
};

export type ValidationError = {
    code: string;
    deviceId?: string;
    message: string;
};

export type PlanLookup = {
    id: string;
    supportsNumberShare: boolean;
};

export type CatalogProduct = {
    id: string;
    slug: string;
    name: string;
    category: DeviceType;
    variants: Array<{
        id: string;
        sku: string;
        name: string;
        variantType: string;
        priceCents: number;
    }>;
};
