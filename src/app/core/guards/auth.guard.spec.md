# Auth Guard - Документация

## Описание

`authGuard` защищает маршрут `/dashboard` от неавторизованных пользователей.

## Реализация

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Разрешить доступ
      } else {
        router.navigate(['/']); // Редирект на главную
        return false; // Запретить доступ
      }
    })
  );
};
```

## Как работает

1. **Проверка пользователя** - через `AuthService.currentUser$`
2. **Если авторизован** - возвращает `true`, доступ разрешен
3. **Если не авторизован** - редирект на `/` и возвращает `false`

## Использование

```typescript
// app.routes.ts
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [authGuard] // ✅ Защита маршрута
}
```

## Особенности

- ✅ Использует функциональный guard (`CanActivateFn`) для standalone компонентов
- ✅ Автоматический редирект неавторизованных пользователей
- ✅ Использует `take(1)` для однократной проверки
- ✅ Реактивный подход через Observable

