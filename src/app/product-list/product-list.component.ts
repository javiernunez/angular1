import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf],
  template: `
    <h3>Product List</h3>
    <input
      type="text"
      [(ngModel)]="filterText"
      (ngModelChange)="onFilterTextChange()"
      placeholder="Search products"
    />
    <button (click)="addProduct()">Add Product</button>
    <ul>
      <li *ngFor="let product of displayedProducts">
        {{ product.id }} | {{ product.name }} - {{ product.price }}
      </li>
    </ul>
    <button *ngIf="hasMoreProducts" (click)="loadMore()">Show More</button>
    <div *ngIf="isLoading">Loading...</div>
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
