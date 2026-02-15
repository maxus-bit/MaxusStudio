import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for the initial auth check to complete
  return authService.authCheckComplete$.pipe(
    filter(complete => complete),
    take(1),
    switchMap(() => authService.currentUser$),
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/']);
      }
    })
  );
};
