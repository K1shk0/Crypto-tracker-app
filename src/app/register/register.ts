import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, // <-- Vigtig for formularer
  FormBuilder,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- Importer her
    RouterLink           // <-- Til "Login her" linket
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  // Dependency Injection
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Definerer vores register-formular (med 'brugernavn')
  registerForm = this.fb.group({
    brugernavn: ['', Validators.required], // <-- Det nye felt
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage: string | null = null;

  onSubmit() {
    this.errorMessage = null;

    if (this.registerForm.valid) {
      // Sæt den korrekte API-sti
      const apiUrl = 'http://localhost:3000/api/register'; // <-- RETTET STI
      const formData = this.registerForm.value;

      this.http.post<any>(apiUrl, formData).subscribe({

        next: (response) => {
          // ----- SUCCES! -----
          console.log('Registrering succesfuld', response);

          // Naviger brugeren til LOGIN-siden, så de kan logge ind
          this.router.navigate(['/login']); // <-- RETTET REDIRECT
        },

        error: (err) => {
          // Håndter fejl (f.eks. "Email er allerede i brug")
          console.error('Registrerings-fejl:', err);
          this.errorMessage = err.error.message || 'Registrering fejlede. Prøv igen.';
        }
      });
    }
  }
}
