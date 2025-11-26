import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CryptoService } from '../services/crypto';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

// We define a "type" for how our wallet data looks
export interface WalletItem {
  id: number;
  user_id: number;
  coin_id: string; // e.g. 'bitcoin'
  amount: number;
  purchase_price: number; // The price at which the coin was bought
  currentPrice: number; // The current price of the coin
  profit: number; // Calculated profit/loss
  last_updated: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink // For the "Back to Market" link
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit { // <-- We use OnInit
  // Dependency Injection
  private http = inject(HttpClient);
  private router = inject(Router);
  private cryptoService = inject(CryptoService);

  // A variable to store wallet data
  walletItems: WalletItem[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // ngOnInit() is a "lifecycle hook"
  // It runs automatically, AS SOON AS the component has been loaded.
  ngOnInit(): void {
    this.fetchWalletData();
  }

  fetchWalletData(): void {
    const apiUrl = 'http://localhost:3000/api/wallet';
    this.isLoading = true;

    this.http.get<WalletItem[]>(apiUrl).pipe(
      switchMap(walletData => {
        if (walletData.length === 0) {
          return of([]); // Return an empty observable if no wallet items
        }

        const coinIds = walletData.map(item => item.coin_id);
        return this.cryptoService.getPrices(coinIds).pipe(
          map((currentPrices: any) => {
            return walletData.map(item => {
              const currentPrice = currentPrices[item.coin_id]?.usd || 0;
              const profit = (currentPrice - item.purchase_price) * item.amount; // Use purchase_price
              return {
                ...item,
                currentPrice,
                profit
              };
            });
          })
        );
      }),
      catchError(err => {
        console.error('Could not fetch wallet or crypto prices:', err);
        this.errorMessage = 'Your session has expired. Please log in again.';
        this.isLoading = false;
        this.logout();
        return of([]); // Return an empty observable on error
      })
    ).subscribe({
      next: (data) => {
        this.walletItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        // This error block will be hit if the outer http.get fails
        // The catchError in the pipe handles errors from switchMap
        console.error('Error fetching wallet:', err);
        this.errorMessage = 'Your session has expired. Please log in again.';
        this.isLoading = false;
        this.logout();
      }
    });
  }

  // This function is called by the "Logout" button
  logout(): void {
    // 1. Remove the token from the browser's memory
    localStorage.removeItem('token');

    // 2. Send the user back to the login page
    this.router.navigate(['/login']);
  }

  sellCoin(coin: WalletItem): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const coinName = coin.coin_id.charAt(0).toUpperCase() + coin.coin_id.slice(1);
    const amountString = prompt(`How much ${coinName} do you want to sell? You own ${coin.amount}.`);
    if (amountString === null || amountString.trim() === '') {
      return; // User cancelled or entered empty string
    }

    const amount = parseFloat(amountString);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number for the amount.');
      return;
    }

    if (amount > coin.amount) {
      alert(`You can't sell more than you own. You only have ${coin.amount} ${coinName}.`);
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      coin_id: coin.coin_id,
      amount: amount
    };

    this.http.post('http://localhost:3000/api/wallet/sell', body, { headers }).subscribe({
      next: (response) => {
        alert(`Successfully sold ${amount} ${coinName}!`);
        console.log('Sell successful:', response);
        this.fetchWalletData(); // Refresh wallet data after selling
      },
      error: (error) => {
        alert('Failed to sell coin. Please try again.');
        console.error('Sell failed:', error);
      }
    });
  }
}
