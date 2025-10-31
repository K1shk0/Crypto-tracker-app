import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Hent tokenet fra localStorage
  const token = localStorage.getItem('token');

  // 2. Tjek om tokenet findes
  if (token) {
    // 3. Klon den oprindelige request (forespørgsel)
    //    og tilføj den nye header med vores token.
    const cloned = req.clone({
      setHeaders: {
        'x-auth-token': token
      }
    });

    // 4. Send den KLONEDE request videre (den med tokenet)
    return next(cloned);
  }

  // 5. Hvis der ikke er noget token, send den oprindelige request videre
  return next(req);
};
