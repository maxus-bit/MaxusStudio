# State Management - RxJS Implementation

## ✅ Реализовано управление состоянием на RxJS

### Архитектура

Приложение использует **RxJS BehaviorSubject** для централизованного управления состоянием. Это оптимальное решение для текущего размера приложения.

## Структура State Management

### 1. AppStateService (`app.state.ts`)

**Централизованное состояние приложения:**

```typescript
interface AppState {
  user: User | null;
  userData: UserData | null;
  chats: Chat[];
  activeChatId: string | null;
  activeSection: 'home' | 'creations' | 'plans';
  isLoading: boolean;
  isGenerating: boolean;
  currentModel: 'v1' | 'v2';
}
```

**Селекторы (Observable):**
- `user$` - текущий пользователь
- `userData$` - данные пользователя
- `chats$` - список чатов
- `activeChatId$` - активный чат
- `activeSection$` - активная секция
- `credits$` - количество кредитов (вычисляемый)
- `isSubscriptionActive$` - активна ли подписка (вычисляемый)
- `activeChat$` - активный чат (комбинированный)

**Actions:**
- `setUser(user)` - установить пользователя
- `setUserData(userData)` - установить данные пользователя
- `setChats(chats)` - установить список чатов
- `setActiveChatId(chatId)` - установить активный чат
- `setActiveSection(section)` - установить активную секцию
- `updateCredits(credits)` - обновить кредиты
- `resetState()` - сбросить состояние

### 2. ChatStateService (`chat.state.ts`)

**Состояние для отдельных чатов:**

```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}
```

**Методы:**
- `getChatState$(chatId)` - получить состояние чата
- `setMessages(chatId, messages)` - установить сообщения
- `addMessage(chatId, message)` - добавить сообщение
- `setIsGenerating(chatId, isGenerating)` - установить состояние генерации

### 3. UIStateService (`ui.state.ts`)

**UI состояние (модальные окна, уведомления):**

```typescript
interface UIState {
  showAuthModal: boolean;
  showEmailVerificationModal: boolean;
  showPasswordResetModal: boolean;
  showSettingsModal: boolean;
  showSubscriptionExpiredModal: boolean;
  sidebarOpen: boolean;
  toastMessages: Array<{id, message, type}>;
}
```

**Методы:**
- `openAuthModal()` / `closeAuthModal()`
- `openSettingsModal()` / `closeSettingsModal()`
- `toggleSidebar()` / `closeSidebar()`
- `addToast(message, type)` / `removeToast(id)`

## Интеграция с сервисами

### AuthService
Автоматически обновляет AppState при изменении пользователя:
```typescript
onAuthStateChanged(this.auth, (user) => {
  this.appState.setUser(user);
});
```

### FirestoreService
Автоматически обновляет AppState при изменении данных:
```typescript
getUserData$(uid).subscribe(userData => {
  this.appState.setUserData(userData);
});

getChatHistory$(uid).subscribe(chats => {
  this.appState.setChats(chats);
});
```

## Использование в компонентах

### DashboardComponent

```typescript
export class DashboardComponent {
  // Observable для использования в шаблоне с async pipe
  user$ = this.appState.user$;
  userData$ = this.appState.userData$;
  activeSection$ = this.appState.activeSection$;
  activeChatId$ = this.appState.activeChatId$;
  isLoading$ = this.appState.isLoading$;
  showSettings$ = this.uiState.showSettingsModal$;

  constructor(
    public appState: AppStateService,
    public uiState: UIStateService
  ) {}

  onSectionChange(section: string) {
    this.appState.setActiveSection(section as any);
  }
}
```

### В шаблоне

```html
<div *ngIf="userData$ | async as userData">
  Credits: {{ userData.credits }}
</div>

<div [class.active]="(activeSection$ | async) === 'home'">
  <!-- content -->
</div>
```

## Преимущества

1. ✅ **Централизованное состояние** - один источник правды
2. ✅ **Реактивность** - автоматическое обновление UI через async pipe
3. ✅ **Типобезопасность** - полная поддержка TypeScript
4. ✅ **Простота** - не требует дополнительных библиотек
5. ✅ **Производительность** - минимальный overhead
6. ✅ **Автоматическая отписка** - при использовании async pipe

## Миграция на NgRx (будущее)

Если приложение вырастет, можно мигрировать на NgRx:

1. Установить: `npm install @ngrx/store @ngrx/effects @ngrx/store-devtools`
2. Создать Actions, Reducers, Effects
3. Заменить BehaviorSubject на Store
4. Миграция будет постепенной - можно использовать оба подхода

**Но для текущего размера приложения RxJS достаточно!**

## Рекомендации

- ✅ Используйте **async pipe** в шаблонах для автоматической отписки
- ✅ Используйте **селекторы** для доступа к данным
- ✅ Используйте **combineLatest** для комбинирования нескольких потоков
- ✅ Не забывайте **отписываться** от подписок в `ngOnDestroy` (если не используете async pipe)

