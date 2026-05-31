import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../core/services/product.service';
import { BasketService } from '../core/services/basket.service';
import { Product } from '../shared/models/product';
import { Brand } from '../shared/models/brand';
import { Category } from '../shared/models/category';
import { ShopParams } from '../shared/models/shopParams';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
    @ViewChild('search') searchTerm?: ElementRef;
    products: Product[] = [];
    brands: Brand[] = [];
    categories: Category[] = [];
    shopParams = new ShopParams();
    totalCount = 0;

    sortOptions = [
        { name: 'Alphabetical', value: 'name' },
        { name: 'Price: Low to High', value: 'PriceAsc' },
        { name: 'Price: High to Low', value: 'PriceDesc' },
    ];

    productService = inject(ProductService);
    basketService = inject(BasketService);

    ngOnInit(): void {
        this.getProducts();
        this.getBrands();
        this.getCategories();
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
}
