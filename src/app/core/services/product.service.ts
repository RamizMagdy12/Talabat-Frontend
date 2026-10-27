import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../shared/models/pagination';
import { Brand } from '../../shared/models/brand';
import { Category } from '../../shared/models/category';
import { ShopParams } from '../../shared/models/shopParams';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = environment.apiUrl + 'Product';

    constructor(private http: HttpClient) { }

    getProducts(shopParams: ShopParams): Observable<Pagination<Product>> {
        let params = new HttpParams();

        if (shopParams.brandId > 0) params = params.append('brandId', shopParams.brandId);
        if (shopParams.categoryId > 0) params = params.append('categoryId', shopParams.categoryId);
        params = params.append('sort', shopParams.sort);
        params = params.append('pageIndex', shopParams.pageIndex);
        params = params.append('pageSize', shopParams.pageSize);
        if (shopParams.search) params = params.append('search', shopParams.search);

        return this.http.get<Pagination<Product>>(this.apiUrl, { params });
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    getBrands(): Observable<Brand[]> {
        return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/categories`);
    }

    getOffers(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/offers`);
    }

    getBestSellers(count = 8): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/bestsellers`, {
            params: { count: String(count) }
        });
    }
}
