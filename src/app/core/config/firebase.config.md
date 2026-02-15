# Firebase Configuration - Документация

## Конфигурация Firebase

Firebase правильно настроен для использования со standalone компонентами Angular.

### Структура

1. **firebase.config.ts** - содержит конфигурацию Firebase
2. **main.ts** - инициализирует Firebase провайдеры

### Провайдеры Firebase

В `main.ts` настроены следующие провайдеры:

```typescript
provideFirebaseApp(() => initializeApp(firebaseConfig))  // Firebase App
provideAuth(() => getAuth())                            // Firebase Auth
provideFirestore(() => getFirestore())                  // Firestore
provideStorage(() => getStorage())                      // Firebase Storage
```

### Использование в сервисах

Все сервисы используют dependency injection для получения Firebase сервисов:

```typescript
// AuthService
constructor(private auth: Auth) {}

// FirestoreService
constructor(private firestore: Firestore) {}

// StorageService
constructor(private storage: Storage) {}
```

### Важно

- ✅ Конфигурация идентична оригинальной (из script.js и dashboard.js)
- ✅ Используется та же Firebase конфигурация - данные не потеряются
- ✅ Все сервисы используют те же методы Firebase
- ✅ Поддержка standalone компонентов (без NgModule)

### Проверка работоспособности

1. Убедитесь, что `@angular/fire` установлен: `npm install @angular/fire firebase`
2. Проверьте, что firebaseConfig совпадает с оригинальным
3. Все сервисы должны работать так же, как в оригинальном коде

