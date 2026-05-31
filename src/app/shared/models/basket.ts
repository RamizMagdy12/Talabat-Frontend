

export interface BasketItem {
    id: number;
    productName: string;
    productUrl: string;
    price: number;
    category: string;
    brand: string;
    quantity: number;
}

export interface Basket {
    id: string;
    items: BasketItem[];
    paymentIntentId?: string;
    clientSecret?: string;
    deliveryMethodId?: number;
}

export class CustomerBasket implements Basket {
    id: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    items: BasketItem[] = [];
    paymentIntentId?: string;
    clientSecret?: string;
    deliveryMethodId?: number;
}

export interface BasketTotals {
    shipping: number;
    subtotal: number;
    total: number;
}
