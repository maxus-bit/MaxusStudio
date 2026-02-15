# Routing Configuration - Документация

## ✅ Роутинг настроен правильно

### Текущая конфигурация

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] // ✅ Защита маршрута
  },
  {
    path: '**',
    redirectTo: '' // ✅ Редирект на главную
  }
];
```

### Особенности

1. **Lazy Loading** - используется `loadComponent` для оптимизации загрузки
2. **Auth Guard** - защита маршрута `/dashboard`
3. **Wildcard Route** - редирект несуществующих маршрутов на главную

### Auth Guard

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // ✅ Разрешить доступ
      } else {
        router.navigate(['/']); // ✅ Редирект на главную
        return false; // ❌ Запретить доступ
      }
    })
  );
};
```

### Альтернативная конфигурация (без lazy loading)

Если нужна конфигурация как в примере (без lazy loading):

```typescript
import { LandingComponent } from './features/landing/landing.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
```

**Но рекомендуется использовать lazy loading** для лучшей производительности!

### Маршруты

| Путь | Компонент | Защита | Описание |
|------|-----------|--------|----------|
| `/` | LandingComponent | ❌ | Главная страница |
| `/privacy` | PrivacyPolicyComponent | ❌ | Политика конфиденциальности |
| `/dashboard` | DashboardComponent | ✅ AuthGuard | Дашборд (требует авторизации) |
| `/**` | - | - | Редирект на `/` |

### Навигация

```typescript
// В компонентах
import { Router } from '@angular/router';

constructor(private router: Router) {}

// Переход на страницу
this.router.navigate(['/dashboard']);
this.router.navigate(['/privacy']);

// С параметрами
this.router.navigate(['/dashboard'], { fragment: 'plans' });
```

### В шаблонах

```html
<!-- RouterLink -->
<a [routerLink]="['/']">Home</a>
<a [routerLink]="['/privacy']">Privacy</a>
<a [routerLink]="['/dashboard']">Dashboard</a>

<!-- С fragment -->
<a [routerLink]="['/']" fragment="plans">Plans</a>
```

### Проверка работоспособности

1. ✅ **Главная страница** (`/`) - доступна всем
2. ✅ **Privacy Policy** (`/privacy`) - доступна всем
3. ✅ **Dashboard** (`/dashboard`) - требует авторизации
4. ✅ **Wildcard** (`/**`) - редирект на главную

### Преимущества текущей конфигурации

1. ✅ **Lazy Loading** - компоненты загружаются по требованию
2. ✅ **Code Splitting** - уменьшение начального bundle
3. ✅ **Защита маршрутов** - AuthGuard проверяет авторизацию
4. ✅ **Standalone компоненты** - современный подход Angular

