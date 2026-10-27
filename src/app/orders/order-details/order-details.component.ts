import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../shared/models/order';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
    order: IOrder | null = null;
    isLoading = true;

    constructor(
        private orderService: OrderService,
        private route: ActivatedRoute,
        private i18n: I18nService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (id) {
            this.orderService.getOrderById(id).subscribe({
                next: (order) => {
                    this.order = order;
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
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

    /** Timeline step index 1..5 for happy path; PaymentFailed stays at payment step. */
    getStepProgress(status: any): number {
        switch (Number(status)) {
            case 0: return 1; // Pending / placed
            case 2: return 2; // Payment failed
            case 1: return 2; // Payment received
            case 3: return 3; // Preparing
            case 4: return 4; // Out for delivery
            case 5: return 5; // Delivered
            default: return 1;
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

    isFailed(status: any): boolean {
        return Number(status) === 2;
    }
}
