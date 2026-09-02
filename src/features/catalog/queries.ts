import { getCatalogPlans, getCatalogProducts } from "./data";
import type { CatalogPlan } from "@configstack/shared-types";

export type CatalogProductResponse = {
    id: string;
    slug: string;
    name: string;
    category: string;
    variants: Array<{
        id: string;
        sku: string;
        name: string;
        variantType: string;
        priceCents: number;
    }>;
};

export async function getEligiblePlans(): Promise<CatalogPlan[]> {
    return getCatalogPlans();
}

export async function getProductsByCategory(): Promise<CatalogProductResponse[]> {
    return getCatalogProducts();
}
