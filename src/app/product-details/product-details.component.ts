import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../core/services/product.service';
import { BasketService } from '../core/services/basket.service';
import { Product } from '../shared/models/product';
import { LocFieldPipe } from '../core/i18n/loc-field.pipe';
import { TranslatePipe } from '../core/i18n/translate.pipe';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, LocFieldPipe, TranslatePipe],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
    product?: Product;
    productService = inject(ProductService);
    basketService = inject(BasketService);
    route = inject(ActivatedRoute);

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            const id = parseInt(idParam, 10);
            this.productService.getProductById(id).subscribe({
                next: (data) => this.product = data,
                error: (err) => console.error(err)
            });
        }
    }

    addItemToBasket() {
        if (this.product) {
            this.basketService.addItemToBasket(this.product);
        }
    }
}
