import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IOrder, IOrderToCreate, IDeliveryMethod } from '../../shared/models/order';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    createOrder(order: IOrderToCreate): Observable<IOrder> {
        return this.http.post<IOrder>(this.baseUrl + 'orders', order);
    }

    getOrdersForUser(): Observable<IOrder[]> {
        return this.http.get<IOrder[]>(this.baseUrl + 'orders');
    }

    getOrderById(id: number): Observable<IOrder> {
        return this.http.get<IOrder>(this.baseUrl + 'orders/' + id);
    }

    getDeliveryMethods(): Observable<IDeliveryMethod[]> {
        return this.http.get<IDeliveryMethod[]>(this.baseUrl + 'orders/deliveryMethod');
    }
}
