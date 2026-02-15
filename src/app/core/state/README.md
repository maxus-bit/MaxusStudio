# State Management - RxJS Implementation

## Архитектура управления состоянием

Приложение использует **RxJS BehaviorSubject/Subject** для управления состоянием. Это легковесное решение, которое покрывает все текущие потребности приложения.

## Структура State Management

### 1. AppStateService (`app.state.ts`)
Централизованное состояние приложения:
- Пользователь и его данные
- Список чатов
- Активный чат
- Активная секция
- Состояния загрузки
- Текущая модель генерации

### 2. ChatStateService (`chat.state.ts`)
Состояние для отдельных чатов:
- Сообщения чата
- Состояние загрузки
- Состояние генерации
- Ошибки

### 3. UIStateService (`ui.state.ts`)
UI состояние:
- Модальные окна
- Sidebar (мобильный)
- Toast уведомления

## Использование

### В компонентах

```typescript
import { AppStateService } from '../../core/state/app.state';
import { UIStateService } from '../../core/state/ui.state';

@Component({...})
export class DashboardComponent {
  constructor(
    private appState: AppStateService,
    private uiState: UIStateService
  ) {}

  ngOnInit() {
    // Подписка на изменения
    this.appState.userData$.subscribe(userData => {
      // Обновление UI
    });

    // Синхронный доступ
    const currentUser = this.appState.user;
  }

  onSectionChange(section: string) {
    this.appState.setActiveSection(section as any);
  }

  openSettings() {
    this.uiState.openSettingsModal();
  }
}
```

### В сервисах

```typescript
import { AppStateService } from '../state/app.state';

@Injectable({ providedIn: 'root' })
export class SomeService {
  constructor(
    private appState: AppStateService,
    private firestoreService: FirestoreService
  ) {}

  async loadChats(uid: string) {
    this.appState.setIsLoading(true);
    try {
      const chats = await this.firestoreService.getChatHistory(uid);
      this.appState.setChats(chats);
    } finally {
      this.appState.setIsLoading(false);
    }
  }
}
```

## Преимущества текущего подхода

1. ✅ **Простота** - не требует дополнительных зависимостей
2. ✅ **Легковесность** - минимальный overhead
3. ✅ **Реактивность** - автоматическое обновление UI
4. ✅ **Типобезопасность** - полная поддержка TypeScript
5. ✅ **Гибкость** - легко расширять

## Миграция на NgRx (если понадобится)

Если приложение вырастет и потребуется более сложное управление состоянием:

1. Установить NgRx: `npm install @ngrx/store @ngrx/effects`
2. Создать Actions, Reducers, Effects
3. Заменить BehaviorSubject на Store
4. Миграция будет постепенной - можно использовать оба подхода

## Рекомендации

- Используйте **селекторы** для доступа к данным
- Используйте **async pipe** в шаблонах для автоматической отписки
- Не забывайте **отписываться** от подписок в `ngOnDestroy`
- Используйте **combineLatest** для комбинирования нескольких потоков

