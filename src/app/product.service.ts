import { map, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: any[] = [];
  private areProductsLoaded = false;
  private productsLoadedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private loadProducts(): void {
    if (!this.areProductsLoaded) {
      this.http.get<any[]>('/angular1/assets/products.json').subscribe(
        (data) => {
          this.products = data;
          this.areProductsLoaded = true;
          this.productsLoadedSubject.next(true);  // Notify that products are loaded
        },
        (error) => {
          console.error('Error loading products:', error);
        }
      );
    }
  }

  getProducts(filterText: string, currentPage: number, pageSize: number): Observable<any[]> {
    return this.productsLoadedSubject.pipe(
      map(() => {
        let filteredProducts = this.products;
        if (filterText !== '') {
          filteredProducts = this.products.filter((product) =>
            product.name.toLowerCase().includes(filterText.toLowerCase())
          );
        }
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredProducts.slice(start, end);
      })
    );
  }

  addProduct(newProduct: any): void {
    if (!this.products.find(product => product.id === newProduct.id)) {
      this.products.push(newProduct);
    }
  }
}
