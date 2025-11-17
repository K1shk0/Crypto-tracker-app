// src/app/components/market/market.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from '../../services/crypto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient and HttpHeaders

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class MarketComponent implements OnInit {

  cryptoData$!: Observable<any[]>;
  sortOrder: string = 'market_cap_rank';

  constructor(
    private cryptoService: CryptoService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpClient // Inject HttpClient
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.cryptoData$ = this.cryptoService.getTopCoins('usd',  100).pipe(
      map((data: any[]) => this.sortData(data))
    );
  }

  sortData(data: any[]): any[] {
    return data.sort((a, b) => {
      switch (this.sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_desc':
          return b.current_price - a.current_price;
        case 'price_asc':
          return a.current_price - b.current_price;
        case 'market_cap_rank':
        default:
          return a.market_cap_rank - b.market_cap_rank;
      }
    });
  }

  setSortOrder(order: string): void {
    this.sortOrder = order;
    this.loadData();
  }

  generateSparkline(data: number[]): SafeHtml {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min)) * height;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] >= data[0];
    const color = isPositive ? '#4caf50' : '#f44336';

    const svg = `
      <svg width="${width}" height="${height}" viewbox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline fill="none" stroke="${color}" stroke-width="1.5" points="${points}"/>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getPercentageClass(value: number): string {
    if (value > 0) {
      return 'positive';
    }
    if (value < 0) {
      return 'negative';
    }
    return '';
  }

  buyCoin(coin: any): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const amountString = prompt(`How much ${coin.name} do you want to buy?`);
    if (amountString === null || amountString.trim() === '') {
      return; // User cancelled or entered empty string
    }

    const amount = parseFloat(amountString);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number for the amount.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      coin_id: coin.id,
      amount: amount,
      purchase_price: coin.current_price // Include the current price as purchase price
    };

    this.http.post('http://localhost:3000/api/wallet/add', body, { headers }).subscribe({
      next: (response) => {
        alert(`Successfully bought ${amount} ${coin.name} at $${coin.current_price}!`);
        console.log('Buy successful:', response);
        this.router.navigate(['/profile']); // Navigate to profile page
      },
      error: (error) => {
        alert('Failed to buy coin. Please try again.');
        console.error('Buy failed:', error);
      }
    });
  }
}
