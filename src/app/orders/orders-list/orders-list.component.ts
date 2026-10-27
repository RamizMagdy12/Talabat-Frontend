import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AccountService } from '../../account/account.service';
import { IOrder } from '../../shared/models/order';
import { take } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
    selector: 'app-orders-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './orders-list.component.html',
    styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit {
    orders: IOrder[] = [];
    isLoading = true;
    userEmail = '';

    constructor(
        private orderService: OrderService,
        private accountService: AccountService,
        private i18n: I18nService
    ) { }

    ngOnInit(): void {
        this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
            if (user) {
                this.userEmail = user.email;
                this.loadOrders();
            } else {
                this.isLoading = false;
            }
        });
    }

    loadOrders(): void {
        this.isLoading = true;
        this.orderService.getOrdersForUser().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    getStatusClass(status: any): string {
        switch (Number(status)) {
            case 1: return 'status--success';
            case 2: return 'status--failed';
            case 3: return 'status--prep';
            case 4: return 'status--ship';
            case 5: return 'status--delivered';
            default: return 'status--pending';
        }
    }

    getStatusIcon(status: any): string {
        switch (Number(status)) {
            case 1:
            case 5: return 'check';
            case 2: return 'x';
            default: return 'clock';
        }
    }

    getStatusText(status: any): string {
        switch (Number(status)) {
            case 0: return this.i18n.t('orders.status.pending');
            case 1: return this.i18n.t('orders.status.paymentReceived');
            case 2: return this.i18n.t('orders.status.paymentFailed');
            case 3: return this.i18n.t('orders.status.preparing');
            case 4: return this.i18n.t('orders.status.outForDelivery');
            case 5: return this.i18n.t('orders.status.delivered');
            default: return this.i18n.t('orders.status.pending');
        }
    }
}
