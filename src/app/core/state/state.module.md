# State Management - Документация

## Обзор

Приложение использует **RxJS BehaviorSubject** для управления состоянием. Это оптимальное решение для текущего размера приложения.

## Сервисы состояния

### 1. AppStateService
**Файл**: `app.state.ts`

**Ответственность**: Глобальное состояние приложения

**Состояние**:
- `user: User | null` - текущий пользователь
- `userData: UserData | null` - данные пользователя
- `chats: Chat[]` - список чатов
- `activeChatId: string | null` - активный чат
- `activeSection: 'home' | 'creations' | 'plans'` - активная секция
- `isLoading: boolean` - состояние загрузки
- `isGenerating: boolean` - состояние генерации
- `currentModel: 'v1' | 'v2'` - текущая модель

**Методы**:
- `setUser(user)` - установить пользователя
- `setUserData(userData)` - установить данные пользователя
- `setChats(chats)` - установить список чатов
- `setActiveChatId(chatId)` - установить активный чат
- `setActiveSection(section)` - установить активную секцию
- `updateCredits(credits)` - обновить кредиты

**Селекторы** (Observable):
- `user$` - текущий пользователь
- `userData$` - данные пользователя
- `chats$` - список чатов
- `credits$` - количество кредитов
- `isSubscriptionActive$` - активна ли подписка
- `activeChat$` - активный чат (комбинированный)

### 2. ChatStateService
**Файл**: `chat.state.ts`

**Ответственность**: Состояние отдельных чатов

**Состояние для каждого чата**:
- `messages: ChatMessage[]` - сообщения
- `isLoading: boolean` - загрузка
- `isGenerating: boolean` - генерация
- `error: string | null` - ошибка

**Методы**:
- `getChatState$(chatId)` - получить состояние чата
- `setMessages(chatId, messages)` - установить сообщения
- `addMessage(chatId, message)` - добавить сообщение
- `setIsGenerating(chatId, isGenerating)` - установить состояние генерации

### 3. UIStateService
**Файл**: `ui.state.ts`

**Ответственность**: UI состояние (модальные окна, уведомления)

**Состояние**:
- `showAuthModal: boolean`
- `showSettingsModal: boolean`
- `showEmailVerificationModal: boolean`
- `showPasswordResetModal: boolean`
- `sidebarOpen: boolean`
- `toastMessages: Array<{id, message, type}>`

**Методы**:
- `openAuthModal()` / `closeAuthModal()`
- `openSettingsModal()` / `closeSettingsModal()`
- `toggleSidebar()` / `closeSidebar()`
- `addToast(message, type)` / `removeToast(id)`

## Интеграция с сервисами

### AuthService
```typescript
// Автоматически обновляет AppState при изменении пользователя
onAuthStateChanged(this.auth, (user) => {
  this.appState.setUser(user);
});
```

### FirestoreService
```typescript
// Автоматически обновляет AppState при изменении данных
getUserData$(uid).subscribe(userData => {
  this.appState.setUserData(userData);
});

getChatHistory$(uid).subscribe(chats => {
  this.appState.setChats(chats);
});
```

## Использование в компонентах

### Пример: DashboardComponent

```typescript
import { AppStateService } from '../../core/state/app.state';
import { UIStateService } from '../../core/state/ui.state';

export class DashboardComponent {
  // Подписки через async pipe в шаблоне
  userData$ = this.appState.userData$;
  chats$ = this.appState.chats$;
  activeSection$ = this.appState.activeSection$;
  
  constructor(
    private appState: AppStateService,
    private uiState: UIStateService
  ) {}

  onSectionChange(section: string) {
    this.appState.setActiveSection(section as any);
  }

  openSettings() {
    this.uiState.openSettingsModal();
  }
}
```

### В шаблоне

```html
<div *ngIf="userData$ | async as userData">
  Credits: {{ userData.credits }}
</div>

<button (click)="openSettings()">Settings</button>
```

## Преимущества

1. ✅ **Централизованное состояние** - один источник правды
2. ✅ **Реактивность** - автоматическое обновление UI
3. ✅ **Типобезопасность** - полная поддержка TypeScript
4. ✅ **Простота** - не требует дополнительных библиотек
5. ✅ **Производительность** - минимальный overhead

## Миграция на NgRx (будущее)

Если приложение вырастет, можно мигрировать на NgRx:

1. Установить: `npm install @ngrx/store @ngrx/effects @ngrx/store-devtools`
2. Создать Actions, Reducers, Effects
3. Заменить BehaviorSubject на Store
4. Миграция будет постепенной

Но для текущего размера приложения **RxJS достаточно**!

