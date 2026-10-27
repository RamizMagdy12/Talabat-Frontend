export interface User {
    email: string;
    displayName: string;
    token: string;
}

export interface Address {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state?: string;
    zipcode?: string;
    country?: string;
}

export interface Profile {
    displayName: string;
    email: string;
    userName: string;
    phoneNumber?: string | null;
    address?: ProfileAddress | null;
}

export interface ProfileAddress {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    country: string;
}
