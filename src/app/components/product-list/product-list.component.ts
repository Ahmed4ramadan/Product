import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interface/product.interface';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  
  selectedCategory: string = 'all';
  searchTerm: string = '';
  priceRange: { min: number; max: number } = { min: 0, max: 1500 };
  sortBy: string = 'name';
  maxPrice: number = 1500;
  loading: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        if (products.length > 0) {
          this.maxPrice = Math.max(...products.map(product => product.price));
          this.priceRange.max = this.maxPrice;
        }
        this.filterProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.loading = false;
      }
    });

    this.productService.getCategoryNames().subscribe({
      next: (categoryNames) => {
        this.categories = categoryNames;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  filterProducts(): void {
   let filtered = this.products.slice();

    if (this.selectedCategory != 'all') {
      filtered = filtered.filter(p => p.category.name === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => 
      p.price >= this.priceRange.min && p.price <= this.priceRange.max
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    this.filteredProducts = filtered;
  }

  onCategoryChange(): void {
    this.filterProducts();
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onPriceRangeChange(): void {
    this.filterProducts();
  }

  onSortChange(): void {
    this.filterProducts();
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.priceRange = { min: 0, max: this.maxPrice };
    this.sortBy = 'name';
    this.filterProducts();
  }
}

