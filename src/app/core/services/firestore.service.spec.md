# FirestoreService - Документация миграции

## Соответствие оригинальному коду

### Методы из dashboard.js:

#### Работа с данными пользователя:
- ✅ `getUserData(uid)` - получение данных пользователя (синхронно)
- ✅ `getUserData$(uid)` - Observable для отслеживания данных в реальном времени
- ✅ `createUserData(uid, email)` - создание данных при первом входе (3 кредита, lastLogin)
- ✅ `updateUserData(uid, data)` - обновление данных пользователя
- ✅ `updateLastLogin(uid)` - обновление времени последнего входа

#### Работа с чатами:
- ✅ `getChatHistory$(uid)` - Observable для истории чатов (сортировка по timestamp desc)
- ✅ `createChat(uid, chat)` - создание нового чата
- ✅ `updateChat(uid, chatId, data)` - обновление чата
- ✅ `deleteChat(uid, chatId)` - удаление чата
- ✅ `getChat$(uid, chatId)` - получение конкретного чата

## Особенности миграции

### Timestamp vs updatedAt:
- Оригинал использует `timestamp` для сортировки чатов
- В модели Chat используется `createdAt` и `updatedAt`
- При создании чата добавляется `timestamp` для совместимости

### Структура UserData:
- `lastLogin` - ISO string (как в оригинале)
- `createdAt` - может быть timestamp или ISO string
- `credits` - начальное значение 3 для новых пользователей

## Использование в компонентах

```typescript
// Подписка на данные пользователя
this.firestoreService.getUserData$(uid).subscribe(userData => {
  if (userData) {
    this.credits = userData.credits;
    this.subscriptionType = userData.subscriptionType;
  }
});

// Подписка на историю чатов
this.firestoreService.getChatHistory$(uid).subscribe(chats => {
  this.chats = chats;
});

// Создание нового чата
const chatId = await this.firestoreService.createChat(uid, {
  userId: uid,
  title: 'New Chat',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Обновление чата
await this.firestoreService.updateChat(uid, chatId, {
  messages: updatedMessages
});
```

