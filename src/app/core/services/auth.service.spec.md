# AuthService - Документация миграции

## Соответствие оригинальному коду

### Методы из script.js:
- ✅ `signInWithEmail` - соответствует `signInWithEmailAndPassword`
- ✅ `signUpWithEmail` - соответствует `createUserWithEmailAndPassword`
- ✅ `signInWithGoogle` - соответствует `signInWithPopup` с GoogleAuthProvider
- ✅ `sendEmailVerification` - соответствует `sendEmailVerification`
- ✅ `sendPasswordResetEmail` - соответствует `sendPasswordResetEmail`
- ✅ `signOut` - соответствует `signOut`

### Логика из dashboard.js:
- ✅ Проверка email verification для email/password аккаунтов
- ✅ Автоматическое подтверждение для Google аккаунтов
- ✅ Редирект на главную при не подтвержденном email

### Observable:
- ✅ `authState$` - отслеживание состояния авторизации через `onAuthStateChanged`

## Использование в компонентах

```typescript
// Подписка на изменения состояния авторизации
this.authService.currentUser$.subscribe(user => {
  if (user) {
    // Пользователь авторизован
  } else {
    // Пользователь не авторизован
  }
});

// Вход по email
try {
  const credential = await this.authService.signInWithEmail(email, password);
  const user = credential.user;
} catch (error) {
  // Обработка ошибок
}

// Регистрация
try {
  const credential = await this.authService.signUpWithEmail(email, password);
  const user = credential.user;
  // Отправка email для подтверждения
  await this.authService.sendEmailVerification(user);
} catch (error) {
  // Обработка ошибок
}
```

