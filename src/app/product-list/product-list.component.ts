import { Component, OnInit, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../core/services/product.service';
import { BasketService } from '../core/services/basket.service';
import { Product, productDisplayPrice } from '../shared/models/product';
import { Brand } from '../shared/models/brand';
import { Category } from '../shared/models/category';
import { ShopParams } from '../shared/models/shopParams';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { LocFieldPipe } from '../core/i18n/loc-field.pipe';
import { I18nService } from '../core/i18n/i18n.service';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, LocFieldPipe],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit {
    @ViewChild('search') searchTerm?: ElementRef;
    products: Product[] = [];
    offers: Product[] = [];
    bestSellers: Product[] = [];
    brands: Brand[] = [];
    categories: Category[] = [];
    shopParams = new ShopParams();
    totalCount = 0;
    private pendingFragment: string | null = null;

    sortOptions = [
        { labelKey: 'shop.sort.name', value: 'name' },
        { labelKey: 'shop.sort.priceAsc', value: 'PriceAsc' },
        { labelKey: 'shop.sort.priceDesc', value: 'PriceDesc' },
    ];

    i18n = inject(I18nService);
    productService = inject(ProductService);
    basketService = inject(BasketService);
    route = inject(ActivatedRoute);

    ngOnInit(): void {
        this.route.fragment.subscribe(fragment => {
            this.pendingFragment = fragment;
            this.scrollToFragment();
        });
        this.getProducts();
        this.getBrands();
        this.getCategories();
        this.getOffers();
        this.getBestSellers();
    }

    ngAfterViewInit(): void {
        this.scrollToFragment();
    }

    getProducts() {
        this.productService.getProducts(this.shopParams).subscribe({
            next: (response: any) => {
                this.products = (response.data || response.items || response.Data || response.Items || []) as Product[];
                this.shopParams.pageIndex = response.pageIndex || response.PageIndex || 1;
                this.shopParams.pageSize = response.pageSize || response.PageSize || 6;
                this.totalCount = response.count || response.Count || 0;
            },
            error: (err) => console.error(err)
        });
    }

    getOffers() {
        this.productService.getOffers().subscribe({
            next: (items) => {
                this.offers = items ?? [];
                this.scrollToFragment();
            },
            error: (err) => console.error(err)
        });
    }

    getBestSellers() {
        this.productService.getBestSellers(8).subscribe({
            next: (items) => {
                this.bestSellers = items ?? [];
                this.scrollToFragment();
            },
            error: (err) => console.error(err)
        });
    }

    private scrollToFragment() {
        if (!this.pendingFragment) return;
        const id = this.pendingFragment;
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    getBrands() {
        this.productService.getBrands().subscribe({
            next: (response) => this.brands = [{ id: 0, name: 'All' }, ...response],
            error: (err) => console.error(err)
        });
    }

    getCategories() {
        this.productService.getCategories().subscribe({
            next: (response) => this.categories = [{ id: 0, name: 'All' }, ...response],
            error: (err) => console.error(err)
        });
    }

    onBrandSelected(brandId: number) {
        this.shopParams.brandId = brandId;
        this.shopParams.pageIndex = 1;
        this.getProducts();
    }

    onCategorySelected(categoryId: number) {
        this.shopParams.categoryId = categoryId;
        this.shopParams.pageIndex = 1;
        this.getProducts();
    }

    onSortSelected(event: any) {
        this.shopParams.sort = event.target.value;
        this.getProducts();
    }

    onPageChanged(page: number) {
        if (this.shopParams.pageIndex !== page) {
            this.shopParams.pageIndex = page;
            this.getProducts();
        }
    }

    onSearch() {
        this.shopParams.search = this.searchTerm?.nativeElement.value;
        this.shopParams.pageIndex = 1;
        this.getProducts();
    }

    onReset() {
        if (this.searchTerm) this.searchTerm.nativeElement.value = '';
        this.shopParams = new ShopParams();
        this.getProducts();
    }

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.shopParams.pageSize);
    }

    get pagesArray(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    addItemToBasket(product: Product) {
        this.basketService.addItemToBasket(product);
    }

    displayPrice(product: Product): number {
        return productDisplayPrice(product);
    }

    offerEndsIn(product: Product): string | null {
        if (!product.hasActiveOffer || !product.offerEndUtc) return null;
        const end = new Date(product.offerEndUtc).getTime();
        const diff = end - Date.now();
        if (diff <= 0) return this.i18n.t('shop.offerEndingSoon');
        const hours = Math.floor(diff / 3_600_000);
        if (hours < 24) return this.i18n.t('shop.offerHoursLeft', { count: Math.max(1, hours) });
        const days = Math.floor(hours / 24);
        return this.i18n.t('shop.offerDaysLeft', { count: days });
    }
}
