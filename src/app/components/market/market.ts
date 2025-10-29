// src/app/components/market/market.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CryptoService } from '../../services/crypto'; // Tilpas stien om nødvendigt

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class MarketComponent implements OnInit {

  // Vi opretter en Observable-variabel.
  // $ er en konvention, der viser, at det er en Observable.
  cryptoData$!: Observable<any>;

  // Vi injicerer vores nye CryptoService
  constructor(private cryptoService: CryptoService) { }

  ngOnInit(): void {
    // Når komponenten starter, kalder vi vores service
    // Bemærk: Vi "subscriber" ikke her. Det lader vi HTML'en om.
    this.cryptoData$ = this.cryptoService.getPrices(
      ['bitcoin', 'ethereum', 'cardano', 'solana', 'dogecoin', 'tether',
       'polkadot', 'binancecoin', 'litecoin', 'ripple', 'usd-coin', 'chainlink',
        'stellar', 'monero', 'avalanche-2', 'tron', 'matic-network', 'crypto-com-chain',
         'uniswap', 'cosmos', 'okb', 'hedera-hashgraph', 'filecoin', 'lido-dao'],// De mønter vi vil se
         
      ['dkk', 'usd', 'eur'] // De valutaer vi vil se prisen i
    );
  }
}
