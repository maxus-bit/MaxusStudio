# Routing Guide - Полное руководство

## ✅ Текущая конфигурация роутинга

### app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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

## Маршруты

| Путь | Компонент | Lazy Loading | Защита | Описание |
|------|-----------|--------------|--------|----------|
| `/` | LandingComponent | ✅ | ❌ | Главная страница |
| `/privacy` | PrivacyPolicyComponent | ✅ | ❌ | Политика конфиденциальности |
| `/dashboard` | DashboardComponent | ✅ | ✅ AuthGuard | Дашборд (требует авторизации) |
| `/**` | - | - | - | Редирект на `/` |

## Auth Guard

### Реализация

```typescript
// core/guards/auth.guard.ts
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

### Как работает

1. **Проверка авторизации** - через `AuthService.currentUser$`
2. **Если авторизован** - возвращает `true`, доступ разрешен
3. **Если не авторизован** - редирект на `/` и возвращает `false`

## Преимущества текущей конфигурации

### Lazy Loading
- ✅ Компоненты загружаются по требованию
- ✅ Уменьшение начального bundle size
- ✅ Улучшение производительности

### Standalone компоненты
- ✅ Современный подход Angular
- ✅ Не требует NgModules
- ✅ Лучшая tree-shaking

### Защита маршрутов
- ✅ AuthGuard проверяет авторизацию
- ✅ Автоматический редирект неавторизованных
- ✅ Реактивный подход через Observable

## Использование

### В компонентах

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

// Переход на страницу
this.router.navigate(['/dashboard']);
this.router.navigate(['/privacy']);

// С fragment (якорь)
this.router.navigate(['/'], { fragment: 'plans' });
```

### В шаблонах

```html
<!-- RouterLink -->
<a [routerLink]="['/']">Home</a>
<a [routerLink]="['/privacy']">Privacy</a>
<a [routerLink]="['/dashboard']">Dashboard</a>

<!-- С fragment -->
<a [routerLink]="['/']" fragment="plans">Plans</a>

<!-- С query параметрами -->
<a [routerLink]="['/dashboard']" [queryParams]="{tab: 'settings'}">Settings</a>
```

## Альтернативная конфигурация (без lazy loading)

Если нужна конфигурация как в примере (прямая загрузка компонентов):

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

## Проверка работоспособности

1. ✅ **Главная страница** (`/`) - доступна всем
2. ✅ **Privacy Policy** (`/privacy`) - доступна всем  
3. ✅ **Dashboard** (`/dashboard`) - требует авторизации (AuthGuard)
4. ✅ **Wildcard** (`/**`) - редирект на главную

## Дополнительные возможности

### Child Routes (для будущего)

Если понадобятся вложенные маршруты:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard],
  children: [
    { path: '', component: DashboardHomeComponent },
    { path: 'settings', component: SettingsComponent }
  ]
}
```

### Route Data

Передача данных в маршрут:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard],
  data: { title: 'Dashboard', requiresAuth: true }
}
```

### Resolvers

Предзагрузка данных:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard],
  resolve: { userData: UserDataResolver }
}
```

## Итог

✅ Роутинг настроен правильно  
✅ Используется lazy loading для оптимизации  
✅ AuthGuard защищает маршрут `/dashboard`  
✅ Все маршруты работают корректно  

