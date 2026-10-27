export interface Product {
    id: number;
    name: string;
    description: string;
    pictureUrl: string;
    price: number;
    offerPrice?: number | null;
    offerStartUtc?: string | null;
    offerEndUtc?: string | null;
    hasActiveOffer?: boolean;
    currentPrice?: number;
    brandId: number;
    brand: string;
    categoryId: number;
    category: string;
}

export function productDisplayPrice(product: Product): number {
    if (product.hasActiveOffer && product.currentPrice != null) {
        return product.currentPrice;
    }
    return product.price;
}
