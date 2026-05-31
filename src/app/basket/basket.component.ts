import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketService } from '../core/services/basket.service';
import { BasketItem } from '../shared/models/basket';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-basket',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './basket.component.html',
    styleUrls: ['./basket.component.css']
})
export class BasketComponent {

    constructor(public basketService: BasketService) { }

    incrementQuantity(item: BasketItem) {
        this.basketService.incrementItemQuantity(item);
    }

    decrementQuantity(item: BasketItem) {
        this.basketService.decrementItemQuantity(item);
    }

    removeItem(item: BasketItem) {
        this.basketService.removeItemFromBasket(item);
    }
}
