import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailsComponent },
    { path: 'basket', canActivate: [authGuard], loadComponent: () => import('./basket/basket.component').then(m => m.BasketComponent) },
    { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./orders/checkout/checkout.component').then(m => m.CheckoutComponent) },
    { path: 'orders', canActivate: [authGuard], loadChildren: () => import('./orders/orders.routes').then(m => m.ordersRoutes) },
    { path: 'account', loadChildren: () => import('./account/account.routes').then(m => m.accountRoutes) },
    { path: '**', redirectTo: '/products', pathMatch: 'full' }
];
