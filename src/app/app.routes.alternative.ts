// Альтернативная конфигурация роутинга (без lazy loading)
// Используйте этот вариант, если нужна прямая загрузка компонентов
// Текущая конфигурация с lazy loading предпочтительнее для производительности

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './features/landing/landing.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routesAlternative: Routes = [
  { path: '', component: LandingComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // Защита маршрута
  },
  { path: '**', redirectTo: '' }
];

