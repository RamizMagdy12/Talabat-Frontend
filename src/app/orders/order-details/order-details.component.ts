import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../shared/models/order';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
    order: IOrder | null = null;
    isLoading = true;

    constructor(
        private orderService: OrderService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (id) {
            this.orderService.getOrderById(id).subscribe({
                next: (order) => {
                    this.order = order;
                    this.isLoading = false;
                    console.log('Order loaded:', order);
                },
                error: (err) => {
                    console.error('Failed to load order', err);
                    this.isLoading = false;
                }
            });
        } else {
            console.error('Missing order id', { id });
            this.isLoading = false;
        }
    }

    getStatusClass(status: any): string {
        switch (status) {
            case 0: return 'status--pending';
            case 1: return 'status--success';
            case 2: return 'status--failed';
            default: return 'status--pending';
        }
    }

    getStepProgress(status: any): number {
        switch (status) {
            case 0: return 1;
            case 1: return 3;
            case 2: return 2;
            default: return 1;
        }
    }

    getStatusText(status: any): string {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'Payment Received';
            case 2: return 'Payment Failed';
            default: return 'Pending';
        }
    }
}
