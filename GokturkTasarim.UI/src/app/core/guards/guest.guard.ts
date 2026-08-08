import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Redirect to respective dashboard if already logged in
  if (authService.isAdmin()) {
    return router.createUrlTree(['/admin']);
  }
  return router.createUrlTree(['/customer']);
};
