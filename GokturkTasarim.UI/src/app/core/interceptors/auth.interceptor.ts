import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Always enable withCredentials so HttpOnly cookies are automatically attached
  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized and not already calling refresh-token or login
      if (
        error.status === 401 &&
        !req.url.includes('/api/auth/refresh-token') &&
        !req.url.includes('/api/auth/login')
      ) {
        // Silent Refresh via HttpOnly cookie
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original failed request with updated cookies
            return next(clonedReq);
          }),
          catchError(refreshErr => {
            // If refresh also fails, redirect to login
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
