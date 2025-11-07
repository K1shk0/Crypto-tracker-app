import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    // Brugeren er logget ind, så tillad adgang
    return true;
  } else {
    // Brugeren er ikke logget ind, omdiriger til login-siden
    router.navigate(['/login']);
    return false;
  }
};
