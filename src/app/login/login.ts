import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, // <-- Importer til formular-logik
  FormBuilder,         // <-- Hjælper med at bygge formen
  Validators           // <-- Tilføjer simpel validering
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- Tilføj til imports
    RouterLink           // <-- Giver os [routerLink] til "Opret konto"
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Dependency Injection på den nye måde
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Definerer vores login-formular
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // En variabel til at holde fejlbeskeder
  errorMessage: string | null = null;

  // Denne funktion kaldes, når formen submittes
  onSubmit() {
    this.errorMessage = null; // Nulstil fejl

    // Tjek om formen er gyldig (om felterne er udfyldt korrekt)
    if (this.loginForm.valid) {
      const apiUrl = 'http://localhost:3000/api/login';
      const formData = this.loginForm.value;

      // Send data til din backend API
      this.http.post<any>(apiUrl, formData).subscribe({

       next: (response) => {
          // ----- DETTE ER DET VIGTIGE -----
          console.log('Login succesfuld, modtog token:', response.token);

          // 1. Gem tokenet i browserens lokale lager
          localStorage.setItem('token', response.token);

          // 2. Naviger brugeren til market-siden
          this.router.navigate(['/market']);
          // ---------------------------------
        },

        error: (err) => {
          // Håndter fejl fra API'en (f.eks. "Ugyldig email eller adgangskode")
          console.error('Login-fejl:', err);
          this.errorMessage = err.error.message || 'Login fejlede. Prøv igen.';
        }
      });
    }
  }
}
