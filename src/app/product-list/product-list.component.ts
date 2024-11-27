import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf],
  styleUrl: './product-list.component.scss',
  template: `
    <div class="product-list">
      <h3 class="title">Product List</h3>
      <div class="controls">
        <input
            class="search-bar"
            type="text"
            [(ngModel)]="filterText"
            (ngModelChange)="onFilterTextChange()"
            placeholder="Search products..."
        />
        <button class="btn add-product-btn" (click)="addProduct()">Add Product</button>
      </div>
      <ul class="product-list-items">
        <li *ngFor="let product of displayedProducts" class="product-item">
          <div class="product-info">
            <span class="product-id">#{{ product.id }}</span>
            <span class="product-name">{{ product.name }}</span>
          </div>
          <span class="product-price">{{ product.price }}</span>
        </li>
      </ul>
      <button *ngIf="hasMoreProducts" class="btn load-more-btn" (click)="loadMore()">Show More</button>
      <div *ngIf="isLoading" class="loading-indicator">Loading...</div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  displayedProducts: any[] = [];
  filterText: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  hasMoreProducts: boolean = true;
  isLoading: boolean = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadMore();
  }

  onFilterTextChange(): void {
    this.reset();
  }

  reset(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.displayedProducts = [];
    this.loadMore();
  }

  loadMore(): void {
    this.isLoading = true;
    this.productService.getProducts(this.filterText, this.currentPage, this.pageSize).subscribe((products) => {
      this.displayedProducts = [...this.displayedProducts, ...products];
      this.isLoading = false;
    });
    this.currentPage++;
  }

  addProduct(): void {
    const newProduct = {
      id: this.displayedProducts.length + 1,
      name: 'New Product ' + (this.displayedProducts.length + 1),
      price: Math.floor(Math.random() * 100) + 1,
    };

    this.displayedProducts = [newProduct, ...this.displayedProducts];
    this.productService.addProduct(newProduct);
  }
}
