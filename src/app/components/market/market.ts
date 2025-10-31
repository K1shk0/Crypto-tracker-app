// src/app/components/market/market.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from '../../services/crypto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

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

  constructor(private cryptoService: CryptoService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.cryptoData$ = this.cryptoService.getMarketData('usd', 
      ['bitcoin', 'ethereum', 'cardano', 'solana', 'dogecoin', 'tether', 'polkadot', 'binancecoin', 'litecoin', 'ripple', 'usd-coin', 'chainlink', 'stellar', 'monero', 'avalanche-2', 'tron', 'crypto-com-chain', 'uniswap', 'cosmos', 'okb', 'hedera-hashgraph', 'filecoin', 'lido-dao', 'shiba-inu', 'dai', 'wrapped-bitcoin', 'near-protocol', 'aptos', 'optimism', 'arbitrum', 'internet-computer', 'vechain', 'quant-network']
    ).pipe(
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
}
