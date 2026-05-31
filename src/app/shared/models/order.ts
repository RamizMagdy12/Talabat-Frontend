export interface IOrder {
    id: number;
    buyerEmail: string;
    orderDate: string;
    status: number;

    shippingAddress: IShippingAddress;

    deliveryMethod: string;
    deliveryMethodCost: number;

    items: IOrderItem[];

    subtotal: number;
    total: number;

    paymentIntentId: string;
}

export interface IShippingAddress {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    country: string;
}

export interface IOrderItem {
    id: number;
    productId: number;
    productName: string;
    pictureUrl: string;
    price: number;
    quantity: number;
}

export interface IDeliveryMethod {
    id: number;
    shortName: string;
    description: string;
    cost: number;
    deliveryTime: string;
}

export interface IOrderToCreate {
    basketId: string;
    deliveryMethod: number;
    shippingAddress: IShippingAddress;
}
