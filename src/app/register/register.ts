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

  if (pw.length < 8) return { pwWeak: 'Password must be at least 8 characters long.' };
  if (!/[A-Z]/.test(pw)) return { pwWeak: 'At least one uppercase letter is required.' };
  if (!/[a-z]/.test(pw)) return { pwWeak: 'At least one lowercase letter is required.' };
  if (!/[0-9]/.test(pw)) return { pwWeak: 'At least one number is required.' };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return { pwWeak: 'At least one special character is required.' };

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
          this.errorMessage = err.error.message || 'Register failed. Please try again.';
        }
      });
    }
  }
}
