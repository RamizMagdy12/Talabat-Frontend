import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { BasketService } from '../../core/services/basket.service';
import { PaymentService } from '../../core/services/payment.service';
import { AccountService } from '../../account/account.service';
import { IDeliveryMethod, IShippingAddress, IOrderToCreate } from '../../shared/models/order';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

declare var Stripe: any;

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
    currentStep = 1;
    deliveryMethods: IDeliveryMethod[] = [];
    selectedDeliveryMethodId: number = 0;
    isSubmitting = false;

    // Stripe
    stripe: any;
    cardElement: any;
    elements: any;
    cardErrors: string = '';
    cardComplete = false;
    clientSecret: string = '';
    paymentIntentId: string = '';
    isLoadingPayment = false;

    address: IShippingAddress = {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        country: '',
        phoneNumber: ''
    };
    addressFromProfile = false;

    constructor(
        private orderService: OrderService,
        public basketService: BasketService,
        private paymentService: PaymentService,
        private accountService: AccountService,
        private router: Router,
        private ngZone: NgZone,
        private i18n: I18nService
    ) { }

    ngOnInit(): void {
        this.orderService.getDeliveryMethods().subscribe({
            next: (methods) => {
                this.deliveryMethods = methods;
                if (methods.length > 0) {
                    this.selectedDeliveryMethodId = methods[0].id;
                }
            },
            error: (err) => console.error('Failed to load delivery methods', err)
        });

        this.accountService.getProfile().subscribe({
            next: (profile) => {
                const saved = profile.address;
                const phone = profile.phoneNumber || '';
                const hasAddress = !!(saved && (saved.firstName || saved.lastName || saved.street || saved.city || saved.country));
                if (!hasAddress && !phone) return;

                this.address = {
                    firstName: saved?.firstName || '',
                    lastName: saved?.lastName || '',
                    street: saved?.street || '',
                    city: saved?.city || '',
                    country: saved?.country || '',
                    phoneNumber: phone
                };
                this.addressFromProfile = true;
            },
            error: (err) => console.error('Failed to load profile address', err)
        });

        // Initialize Stripe
        if (typeof Stripe !== 'undefined') {
            this.stripe = Stripe(environment.stripePublishableKey);
        }
    }

    ngOnDestroy(): void {
        if (this.cardElement) {
            this.cardElement.destroy();
        }
    }

 cardReady = false; // ✅ أضف ده

private mountStripeCard(): void {
    if (!this.stripe) return;

    if (this.cardElement) {
        this.cardElement.destroy();
        this.cardElement = null;
        this.cardReady = false; // ✅ reset
    }

    this.elements = this.stripe.elements();

    const style = { /* نفس الـ style */ };

    this.cardElement = this.elements.create('card', {
        style,
        hidePostalCode: true
    });

    const cardMount = document.getElementById('card-element');
    if (cardMount) {
        cardMount.innerHTML = '';
        this.cardElement.mount('#card-element');

        this.cardElement.on('ready', () => {
            this.ngZone.run(() => {
                this.cardReady = true; // ✅ دلوقتي بس يبقى ready
                console.log('Stripe card ready');
            });
        });

        this.cardElement.on('change', (event: any) => {
            this.ngZone.run(() => {
                this.cardErrors = event.error ? event.error.message : '';
                this.cardComplete = event.complete;
            });
        });
    }
}

    get selectedDeliveryMethod(): IDeliveryMethod | undefined {
        return this.deliveryMethods.find(m => m.id === this.selectedDeliveryMethodId);
    }

    get basketItems() {
        return this.basketService.getCurrentBasketValue()?.items ?? [];
    }

    get basketSubtotal(): number {
        return this.basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    get deliveryCost(): number {
        return this.selectedDeliveryMethod?.cost ?? 0;
    }

    get orderTotal(): number {
        return this.basketSubtotal + this.deliveryCost;
    }

    onAddressEdited(): void {
        this.addressFromProfile = false;
    }

    isAddressValid(): boolean {
        return !!(
            this.address.firstName &&
            this.address.lastName &&
            this.address.street &&
            this.address.city &&
            this.address.country &&
            this.address.phoneNumber
        );
    }

    nextStep(): void {
        if (this.currentStep === 1 && !this.isAddressValid()) {
            Swal.fire({
                icon: 'warning',
                title: this.i18n.t('checkout.msg.incompleteAddressTitle'),
                text: this.i18n.t('checkout.msg.incompleteAddressText'),
                confirmButtonText: this.i18n.t('common.ok')
            });
            return;
        }
        if (this.currentStep === 2) {
            // Persist delivery method, then create a fresh PaymentIntent for the correct amount
            this.clientSecret = '';
            this.paymentIntentId = '';
            this.basketService.setDeliveryMethodId(this.selectedDeliveryMethodId)?.subscribe({
                next: () => {
                    this.currentStep = 3;
                    this.createPaymentIntent();
                },
                error: () => {
                    this.currentStep = 3;
                    this.createPaymentIntent();
                }
            });
            return;
        }
        if (this.currentStep < 4) {
            this.currentStep++;

            // When entering the payment step, create payment intent and mount card
            if (this.currentStep === 3) {
                this.createPaymentIntent();
            }
        }
    }

    onDeliveryMethodSelected(methodId: number): void {
        this.selectedDeliveryMethodId = methodId;
        this.basketService.setDeliveryMethodId(methodId)?.subscribe();
        // Amount changed — recreate PaymentIntent on next payment step
        this.clientSecret = '';
        this.paymentIntentId = '';
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    goToStep(step: number): void {
        if (step === 1) {
            this.currentStep = step;
        } else if (step === 2 && this.isAddressValid()) {
            this.currentStep = step;
        } else if (step === 3 && this.isAddressValid() && this.selectedDeliveryMethodId > 0) {
            this.currentStep = step;
            this.createPaymentIntent();
        } else if (step === 4 && this.isAddressValid() && this.selectedDeliveryMethodId > 0 && this.cardComplete) {
            this.currentStep = step;
        }
    }
private createPaymentIntent(): void {
    if (this.clientSecret) {
        setTimeout(() => this.mountStripeCard(), 0); // ✅
        return;
    }

    this.isLoadingPayment = true;
    this.paymentService.createPaymentIntent().subscribe({
        next: (basket) => {
            this.isLoadingPayment = false;
            this.clientSecret = basket.clientSecret || '';
            this.paymentIntentId = basket.paymentIntentId || '';
            
            setTimeout(() => this.mountStripeCard(), 0); // ✅ استنى الـ DOM يترسم
        },
        error: (err) => {
            this.isLoadingPayment = false;
            console.error('Failed to create payment intent', err);
            Swal.fire({
                icon: 'error',
                title: this.i18n.t('checkout.msg.paymentSetupFailedTitle'),
                text: this.i18n.t('checkout.msg.paymentSetupFailedText'),
                confirmButtonText: this.i18n.t('common.ok')
            });
        }
    });
}   

  async submitOrder(): Promise<void> {
    const basket = this.basketService.getCurrentBasketValue();
    if (!basket) return;

    if (!this.cardComplete) {
        Swal.fire({
            icon: 'warning',
            title: this.i18n.t('checkout.msg.cardIncompleteTitle'),
            text: this.i18n.t('checkout.msg.cardIncompleteText'),
            confirmButtonText: this.i18n.t('common.ok')
        });
        return;
    }

    this.isSubmitting = true;

    try {
        const { error } = await this.stripe.confirmCardPayment(
            this.clientSecret,
            {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: `${this.address.firstName} ${this.address.lastName}`
                    }
                }
            }
        );

        if (error) {
            this.isSubmitting = false;
            // Stale/succeeded PaymentIntent — force a new one on retry
            if (error.code === 'payment_intent_unexpected_state' || error.code === 'processing_error') {
                this.clientSecret = '';
                this.paymentIntentId = '';
                this.cardComplete = false;
            }
            Swal.fire({
                icon: 'error',
                title: this.i18n.t('checkout.msg.paymentFailedTitle'),
                text: error.message || this.i18n.t('checkout.msg.paymentFailedText'),
                confirmButtonText: this.i18n.t('common.ok')
            });
            return;
        }

    

        // باقي كود الـ order...
        const order: IOrderToCreate = {
            basketId: basket.id,
            deliveryMethod: this.selectedDeliveryMethodId,
            shippingAddress: this.address
        };

        this.orderService.createOrder(order).subscribe({
            next: (createdOrder) => {
                this.isSubmitting = false;
                this.basketService.deleteBasket(basket.id).subscribe();
                Swal.fire({
                    icon: 'success',
                    title: this.i18n.t('checkout.msg.paymentSuccessTitle'),
                    html: `<p>${this.i18n.t('checkout.msg.orderPlaced', { id: createdOrder.orderNumber || createdOrder.id })}</p>`,
                    confirmButtonText: this.i18n.t('checkout.msg.viewOrders')
                }).then(() => this.router.navigateByUrl('/orders'));
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: this.i18n.t('checkout.msg.orderFailedTitle'),
                    text: this.i18n.t('checkout.msg.orderFailedText'),
                    confirmButtonText: this.i18n.t('common.ok')
                });
            }
        });

    } catch (err) {
        this.isSubmitting = false;
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: this.i18n.t('checkout.msg.paymentErrorTitle'),
            text: this.i18n.t('checkout.msg.paymentErrorText'),
            confirmButtonText: this.i18n.t('common.ok')
        });
    }
  }}
