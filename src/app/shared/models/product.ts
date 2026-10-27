export interface Product {
    id: number;
    name: string;
    nameAr?: string | null;
    description: string;
    descriptionAr?: string | null;
    pictureUrl: string;
    price: number;
    offerPrice?: number | null;
    offerStartUtc?: string | null;
    offerEndUtc?: string | null;
    hasActiveOffer?: boolean;
    currentPrice?: number;
    brandId: number;
    brand: string;
    brandAr?: string | null;
    categoryId: number;
    category: string;
    categoryAr?: string | null;
}

export function productDisplayPrice(product: Product): number {
    if (product.hasActiveOffer && product.currentPrice != null) {
        return product.currentPrice;
    }
    return product.price;
}
