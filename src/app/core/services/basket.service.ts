import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Basket, BasketItem, BasketTotals, CustomerBasket } from '../../shared/models/basket';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Product } from '../../shared/models/product';

@Injectable({
    providedIn: 'root'
})
export class BasketService {
    baseUrl = environment.apiUrl;
    private basketSource = new BehaviorSubject<Basket | null>(null);
    basketSource$ = this.basketSource.asObservable();
    private basketTotalSource = new BehaviorSubject<BasketTotals | null>(null);
    basketTotalSource$ = this.basketTotalSource.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    getBasket(id: string) {
        return this.http.get<Basket>(this.baseUrl + 'basket?basketid=' + id).pipe(
            map((basket: Basket) => {
                this.basketSource.next(basket);
                this.calculateTotals();
            }),
            catchError(this.handleError)
        );
    }

    setBasket(basket: Basket) {
        return this.http.post<Basket>(this.baseUrl + 'basket', basket).pipe(
            map((response: Basket) => {
                this.basketSource.next(response);
                this.calculateTotals();
            }),
            catchError(this.handleError)
        );
    }

    getCurrentBasketValue() {
        return this.basketSource.value;
    }

    setLocalBasket(basket: Basket) {
        this.basketSource.next(basket);
        this.calculateTotals();
    }

    setDeliveryMethodId(deliveryMethodId: number) {
        const basket = this.getCurrentBasketValue();
        if (!basket) return;
        basket.deliveryMethodId = deliveryMethodId;
        return this.setBasket(basket);
    }

    addItemToBasket(item: Product | BasketItem, quantity = 1) {
        const token = localStorage.getItem('token');
        if (!token) {
            void Swal.fire({
                icon: 'warning',
                title: 'Sign in required',
                text: 'You must be logged in to add items to your cart.',
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                allowOutsideClick: true
            }).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigateByUrl('/account/login');
                }
            });
            return;
        }

        if (this.isProduct(item)) {
            item = this.mapProductItemToBasketItem(item);
        }
        const basket = this.getCurrentBasketValue() ?? this.createBasket();
        basket.items = this.addOrUpdateItem(basket.items, item, quantity);
        this.setBasket(basket).subscribe({
            next: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Item added to your cart',
                    showConfirmButton: false,
                    timer: 1800,
                    timerProgressBar: true
                });
            }
        });
    }

    incrementItemQuantity(item: BasketItem) {
        const basket = this.getCurrentBasketValue();
        if (!basket) return;
        const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
        if (foundItemIndex !== -1) {
            basket.items[foundItemIndex].quantity++;
            this.setBasket(basket).subscribe();
        }
    }

    decrementItemQuantity(item: BasketItem) {
        const basket = this.getCurrentBasketValue();
        if (!basket) return;
        const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
        if (foundItemIndex !== -1) {
            if (basket.items[foundItemIndex].quantity > 1) {
                basket.items[foundItemIndex].quantity--;
                this.setBasket(basket).subscribe();
            } else {
                this.removeItemFromBasket(item);
            }
        }
    }

    removeItemFromBasket(item: BasketItem) {
        const basket = this.getCurrentBasketValue();
        if (!basket) return;
        if (basket.items.some(x => x.id === item.id)) {
            Swal.fire({
                title: 'Remove item?',
                text: 'Do you want to remove this item from the cart?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'Keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    basket.items = basket.items.filter(i => i.id !== item.id);
                    if (basket.items.length > 0) {
                        this.setBasket(basket).subscribe({
                            next: () => {
                                Swal.fire(
                                    'Removed!',
                                    'Item has been removed from your cart.',
                                    'success'
                                );
                            }
                        });
                    } else {
                        this.deleteBasket(basket.id).subscribe({
                            next: () => {
                                Swal.fire(
                                    'Removed!',
                                    'Item has been removed from your cart.',
                                    'success'
                                );
                            }
                        });
                    }
                }
            });
        }
    }

    deleteLocalBasket() {
        this.basketSource.next(null);
        this.basketTotalSource.next(null);
        localStorage.removeItem('basket_id');
    }

    deleteBasket(id: string) {
        return this.http.delete(this.baseUrl + 'basket?basketId=' + id).pipe(
            map(() => {
                this.basketSource.next(null);
                this.basketTotalSource.next(null);
                localStorage.removeItem('basket_id');
            }),
            catchError(this.handleError)
        );
    }

    private calculateTotals() {
        const basket = this.getCurrentBasketValue();
        if (!basket) return;
        const shipping = 0;
        const subtotal = basket.items.reduce((a, b) => (b.price * b.quantity) + a, 0);
        const total = subtotal + shipping;
        this.basketTotalSource.next({ shipping, total, subtotal });
    }

    private addOrUpdateItem(items: BasketItem[], itemToAdd: BasketItem, quantity: number): BasketItem[] {
        const item = items.find(i => i.id === itemToAdd.id);
        if (item) {
            item.quantity += quantity;
        } else {
            itemToAdd.quantity = quantity;
            items.push(itemToAdd);
        }
        return items;
    }

    private createBasket(): Basket {
        const basket = new CustomerBasket();
        localStorage.setItem('basket_id', basket.id);
        return basket;
    }

    private mapProductItemToBasketItem(item: Product): BasketItem {
        return {
            id: item.id,
            productName: item.name,
            price: item.price,
            quantity: 0,
            productUrl: item.pictureUrl,
            brand: item.brand,
            category: item.category
        };
    }

    private isProduct(item: Product | BasketItem): item is Product {
        return (item as Product).pictureUrl !== undefined;
    }

    private handleError(error: HttpErrorResponse) {
        console.error('An error occurred:', error.message);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}
