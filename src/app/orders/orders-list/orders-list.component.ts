import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AccountService } from '../../account/account.service';
import { IOrder } from '../../shared/models/order';
import { take } from 'rxjs';

@Component({
    selector: 'app-orders-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './orders-list.component.html',
    styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit {
    orders: IOrder[] = [];
    isLoading = true;
    userEmail = '';

    constructor(
        private orderService: OrderService,
        private accountService: AccountService
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
            case 0: return 'Pending';
            case 1: return 'Payment Received';
            case 2: return 'Payment Failed';
            case 3: return 'Preparing';
            case 4: return 'Out For Delivery';
            case 5: return 'Delivered';
            default: return 'Pending';
        }
    }
}
