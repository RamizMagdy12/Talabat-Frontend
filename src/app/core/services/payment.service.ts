import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Basket } from '../../shared/models/basket';
import { Observable, map } from 'rxjs';
import { BasketService } from './basket.service';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    baseUrl = environment.apiUrl;

    constructor(private http: HttpClient, private basketService: BasketService) { }

    createPaymentIntent(): Observable<Basket> {
        const basket = this.basketService.getCurrentBasketValue();
        if (!basket) {
            throw new Error('No basket found');
        }
        return this.http.post<Basket>(this.baseUrl + 'payments/' + basket.id, {}).pipe(
            map((updatedBasket: Basket) => {
                this.basketService.basketSource$.subscribe(); // keep basket in sync
                return updatedBasket;
            })
        );
    }
}
