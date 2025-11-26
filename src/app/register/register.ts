import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

// ---- PASSWORD VALIDATOR ----
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.value || '';

  if (pw.length < 8) return { pwWeak: 'Adgangskoden skal være mindst 8 tegn.' };
  if (!/[A-Z]/.test(pw)) return { pwWeak: 'Mindst ét stort bogstav kræves.' };
  if (!/[a-z]/.test(pw)) return { pwWeak: 'Mindst ét lille bogstav kræves.' };
  if (!/[0-9]/.test(pw)) return { pwWeak: 'Mindst ét tal kræves.' };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return { pwWeak: 'Mindst ét specialtegn kræves.' };

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    brugernavn: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]]
  });

  errorMessage: string | null = null;

  onSubmit() {
    this.errorMessage = null;

    if (this.registerForm.valid) {
      const apiUrl = 'http://localhost:3000/api/register';
      const formData = this.registerForm.value;

      this.http.post<any>(apiUrl, formData).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Registrering fejlede. Prøv igen.';
        }
      });
    }
  }
}
