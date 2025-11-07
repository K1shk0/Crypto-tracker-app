import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

// Vi definerer en "type" for, hvordan vores wallet-data ser ud
export interface WalletItem {
  id: number;
  user_id: number;
  coin_id: string; // f.eks. 'bitcoin'
  amount: number;
  last_updated: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink // Til "Tilbage til Market" linket
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit { // <-- Vi bruger OnInit
  // Dependency Injection
  private http = inject(HttpClient);
  private router = inject(Router);

  // En variabel til at gemme pung-dataene
  walletItems: WalletItem[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // ngOnInit() er en "livscyklus-hook"
  // Den kører automatisk, LIGE SÅ SNART komponenten er blevet loadet.
  ngOnInit(): void {
    this.fetchWalletData();
  }

  fetchWalletData(): void {
    const apiUrl = 'http://localhost:3000/api/wallet';
    this.isLoading = true;

    // Vores 'auth.interceptor' vedhæfter automatisk tokenet til dette kald!
    this.http.get<WalletItem[]>(apiUrl).subscribe({
      next: (data) => {
        // Succes! Gem dataene i vores variabel
        this.walletItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        // Fejl! Dette sker højst sandsynligt, hvis tokenet er ugyldigt
        console.error('Kunne ikke hente wallet:', err);
        this.errorMessage = 'Din session er udløbet. Log venligst ind igen.';
        this.isLoading = false;

        // Hvis vi får en fejl (f.eks. 401), så log brugeren ud
        // og send dem til login-siden
        this.logout();
      }
    });
  }

  // Denne funktion kaldes af "Log ud"-knappen
  logout(): void {
    // 1. Fjern tokenet fra browserens hukommelse
    localStorage.removeItem('token');

    // 2. Send brugeren tilbage til login-siden
    this.router.navigate(['/login']);
  }
}
