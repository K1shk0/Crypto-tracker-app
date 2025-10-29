// src/app/components/market/market.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from '../../services/crypto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class MarketComponent implements OnInit {

  cryptoData$!: Observable<any[]>;

  constructor(private cryptoService: CryptoService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.cryptoData$ = this.cryptoService.getMarketData('usd', 
      ['bitcoin', 'ethereum', 'cardano', 'solana', 'dogecoin', 'tether', 'polkadot', 'binancecoin', 'litecoin', 'ripple', 'usd-coin', 'chainlink', 'stellar', 'monero', 'avalanche-2', 'tron', 'matic-network', 'crypto-com-chain', 'uniswap', 'cosmos', 'okb', 'hedera-hashgraph', 'filecoin', 'lido-dao']
    ).pipe(
      map((data: any[]) => data.sort((a, b) => b.current_price - a.current_price))
    );
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
    const color = isPositive ? '#26a69a' : '#ef5350';

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