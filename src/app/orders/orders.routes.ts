import { Routes } from '@angular/router';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { CheckoutComponent } from './checkout/checkout.component';

export const ordersRoutes: Routes = [
    { path: '', component: OrdersListComponent },
    { path: ':id', component: OrderDetailsComponent }
];
