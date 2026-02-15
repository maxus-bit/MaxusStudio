import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { GeminiApiService } from '../../core/services/gemini-api.service';
import { TranslationService } from '../../core/services/translation.service';
import { StorageService } from '../../core/services/storage.service';
import { ToastService } from '../../shared/services/toast.service';
import { AppStateService } from '../../core/state/app.state';
import { UIStateService } from '../../core/state/ui.state';
import { ChatMessage } from '../../core/models/chat.model';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatFeedComponent } from './components/chat-feed/chat-feed.component';
import { PromptBoxComponent } from './components/prompt-box/prompt-box.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { PlansComponent } from './components/plans/plans.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { SubscriptionExpiredModalComponent } from './components/subscription-expired-modal/subscription-expired-modal.component';
import { LoadingScreenComponent } from '../../shared/components/loading-screen/loading-screen.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ChatFeedComponent,
    PromptBoxComponent,
    GalleryComponent,
    PlansComponent,
    SettingsModalComponent,
    SubscriptionExpiredModalComponent,
    LoadingScreenComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Используем Observable из AppState для реактивности через getter
  get user$() { return this.appState.user$; }
  get userData$() { return this.appState.userData$; }
  get activeSection$() { return this.appState.activeSection$; }
  get activeChatId$() { return this.appState.activeChatId$; }
  get isLoading$() { return this.appState.isLoading$; }
  get isGenerating$() { return this.appState.isGenerating$; }
  get currentModel$() { return this.appState.currentModel$; }
  get showSettings$() { return this.uiState.showSettingsModal$; }
  
  // Состояние выпадающего меню профиля
  isUserDropdownOpen = false;

  // Изображения для prompt-box (теперь массив)
  promptBoxImages: string[] = [];
  
  // Комбинированные Observable для чата
  get activeChatMessages$() {
    return combineLatest([
      this.appState.chats$,
      this.appState.activeChatId$
    ]).pipe(
      map(([chats, activeChatId]) => {
        if (!activeChatId) return [];
        const chat = chats.find(c => c.id === activeChatId);
        return chat?.messages || [];
      })
    );
  }

  get showWelcome$() {
    return combineLatest([
      this.activeChatMessages$,
      this.appState.activeChatId$
    ]).pipe(
      map(([messages, chatId]) => {
        // Показываем welcome только если нет активного чата И нет сообщений
        return !chatId && messages.length === 0;
      })
    );
  }

  get isLocked$() {
    return combineLatest([
      this.userData$,
      this.appState.isSubscriptionActive$
    ]).pipe(
      map(([userData, isSubscriptionActive]) => {
        if (!userData) return false;
        // Блокируем если подписка истекла (только для платных пользователей)
        if (userData.subscriptionExpiry && !isSubscriptionActive) {
          return true;
        }
        // Блокируем если нет кредитов
        return (userData.credits || 0) <= 0;
      })
    );
  }

  get showSubscriptionExpiredModal$() {
    return combineLatest([
      this.userData$,
      this.appState.isSubscriptionActive$
    ]).pipe(
      map(([userData, isSubscriptionActive]) => {
        // Показываем модальное окно только если подписка истекла
        if (!userData?.subscriptionExpiry) return false;
        if (isSubscriptionActive) return false;
        
        // Показываем только один раз за сессию
        const modalShown = sessionStorage.getItem('subscriptionExpiredModalShown');
        if (!modalShown) {
          sessionStorage.setItem('subscriptionExpiredModalShown', 'true');
          return true;
        }
        return false;
      })
    );
  }

  private abortController: AbortController | null = null;
  // Temporary storage for images if generation is stopped
  private lastAttachedImages: string[] = [];

  constructor(
    public authService: AuthService,
    private firestoreService: FirestoreService,
    private geminiApiService: GeminiApiService,
    private translationService: TranslationService,
    private storageService: StorageService,
    private toastService: ToastService,
    public appState: AppStateService,
    public uiState: UIStateService,
    private router: Router
  ) {}

  ngOnInit() {
    // Добавляем класс для блокировки скролла на дашборде
    document.body.classList.add('dashboard-page');
    document.body.classList.remove('landing-page');
    // Подписка на пользователя - состояние обновляется автоматически через AuthService
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      
      this.appState.setUser(user);
      
      // Загружаем данные пользователя - состояние обновляется автоматически через FirestoreService
      this.firestoreService.getUserData$(user.uid).subscribe();
      this.firestoreService.getChatHistory$(user.uid).subscribe();
      
      this.appState.setIsLoading(false);
    });
  }

  ngOnDestroy() {
    // Убираем класс при выходе из дашборда
    document.body.classList.remove('dashboard-page');
    
    // Отменяем генерацию при уничтожении компонента
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  async logout() {
    await this.authService.logout();
    this.appState.resetState();
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown() {
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const profileWrapper = target.closest('.profile-wrapper');
    if (!profileWrapper && this.isUserDropdownOpen) {
      this.closeUserDropdown();
    }
  }

  onSectionChange(section: string) {
    // Сбрасываем активный чат при переключении раздела
    this.appState.setActiveChatId(null);
    this.appState.setActiveSection(section as 'home' | 'creations' | 'plans');
  }

  onChatSelected(chatId: string) {
    // Переключаемся на раздел Home при выборе чата
    this.appState.setActiveSection('home');
    this.appState.setActiveChatId(chatId);
  }

  onNewChat() {
    this.appState.setActiveChatId(null);
    this.appState.setActiveSection('home');
  }

  onSettingsOpened() {
    this.uiState.openSettingsModal();
  }

  onSettingsClosed() {
    this.uiState.closeSettingsModal();
  }

  onModelChanged(model: 'v1' | 'v2') {
    this.appState.setCurrentModel(model);
  }

  onPromptBoxGoToPlans() {
    this.appState.setActiveSection('plans');
  }

  onSubscriptionExpiredClose() {
    // Модальное окно можно закрыть, но генерация останется заблокированной
    // Не удаляем флаг из sessionStorage, чтобы не показывать снова в этой сессии
  }

  onSubscriptionExpiredGoToPlans() {
    this.appState.setActiveSection('plans');
  }

  onImageAttached(imageUrl: string) {
    // Добавляем новое изображение в массив
    this.promptBoxImages.push(imageUrl);
  }

  onImageRemoved(index: number) {
    // Удаляем изображение по индексу
    if (index >= 0 && index < this.promptBoxImages.length) {
      this.promptBoxImages.splice(index, 1);
    }
  }

  // Вспомогательный метод для красивых ошибок
  private getFriendlyErrorMessage(error: any): string {
    const message = (error.message || '').toLowerCase();
    
    if (message.includes('429') || message.includes('resource exhausted') || message.includes('quota') || message.includes('too many requests')) {
      return 'Server busy. Try again in a minute.';
    }
    
    if (message.includes('safety') || message.includes('blocked') || message.includes('policy') || message.includes('filter')) {
      return 'Request blocked by safety filter. Try modifying your prompt.';
    }
    
    if (message.includes('500') || message.includes('internal') || message.includes('server error')) {
      return 'Server error. Please try again later.';
    }
    
    if (message.includes('network') || message.includes('failed to fetch') || message.includes('connection')) {
      return 'Connection error. Check your internet.';
    }
    
    if (message.includes('credit') || message.includes('balance') || message.includes('insufficient')) {
        return 'Not enough credits. Please upgrade your plan.';
    }

    if (message.includes('404') || message.includes('not found')) {
        return 'Service unavailable temporarily. Try V1 model.';
    }
    
    // Default fallback
    return 'Generation failed. Please try again.';
  }

  async onGenerate(event: { prompt: string; images: string[]; model: 'v1' | 'v2' }) {
    // Проверяем блокировку
    const isLocked = await this.isLocked$.pipe(take(1)).toPromise();
    if (isLocked) {
      this.toastService.error('Generations are blocked. Please check your subscription or credits.');
      return;
    }

    // Проверяем кредиты
    const userData = await this.userData$.pipe(take(1)).toPromise();
    if (!userData || (userData.credits || 0) <= 0) {
      this.toastService.error('Generations are over!');
      return;
    }

    // Если генерация уже идет - останавливаем
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.appState.setIsGenerating(false);
      
      // Restore attached images if stopped manually
      if (this.lastAttachedImages.length > 0) {
          this.promptBoxImages = [...this.lastAttachedImages];
      }
      
      this.toastService.info('Generation stopped');
      return;
    }

    const user = await this.user$.pipe(take(1)).toPromise();
    if (!user) return;

    const rawPrompt = event.prompt.trim();
    if (!rawPrompt) {
      this.toastService.error('Write a topic for the video!');
      return;
    }

    // Начинаем генерацию
    this.appState.setIsGenerating(true);
    this.abortController = new AbortController();
    
    // Save current images in case of stop/cancellation
    this.lastAttachedImages = [...this.promptBoxImages];
    // Clear current images from view while generating
    this.promptBoxImages = [];

    try {
      // Step REMOVED: No translation needed. Backend (Gemini) handles it.
      // const translatedText = await this.translationService.translateToEnglish(rawPrompt);
      const textForGeneration = rawPrompt;
      
      if (this.abortController.signal.aborted) {
        throw new Error('Generation cancelled');
      }

      // 2. Генерируем изображение через Gemini/Imagen API
      const initImage = event.images && event.images.length > 0 ? event.images[0] : undefined;

      const response = await this.geminiApiService.generateImage(
        {
          prompt: textForGeneration,
          image: initImage, // Using the first image if available
          mode: initImage ? 'image-to-image' : 'text-to-image',
          model: event.model
        },
        this.abortController.signal
      );

      if (this.abortController.signal.aborted) {
        throw new Error('Generation cancelled');
      }

      // 3. Загружаем в Firebase Storage
      // Gemini API service should return a base64 string which we upload
      const imageUrl = await this.storageService.uploadImageBase64(user.uid, response.image);

      if (this.abortController.signal.aborted) {
        throw new Error('Generation cancelled');
      }

      // 4. Создаем сообщения
      const userMessage: ChatMessage = {
        role: 'user',
        content: rawPrompt // Показываем оригинальный русский текст
      };

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: imageUrl
      };

      // 5. Сохраняем в чат
      const activeChatId = await this.activeChatId$.pipe(take(1)).toPromise();
      
      if (activeChatId) {
        // Обновляем существующий чат
        const currentChat = await this.appState.chats$.pipe(take(1)).toPromise();
        const chat = currentChat?.find(c => c.id === activeChatId);
        const oldMessages = chat?.messages || [];
        const updatedMessages = [...oldMessages, userMessage, aiMessage];
        
        await this.firestoreService.updateChatMessages(user.uid, activeChatId, updatedMessages);
      } else {
        // Создаем новый чат
        const newChat = {
          timestamp: new Date().toISOString(),
          isPinned: false,
          customName: rawPrompt.slice(0, 30) + '...',
          messages: [userMessage, aiMessage]
        };
        
        const chatId = await this.firestoreService.createChat(user.uid, newChat);
        this.appState.setActiveChatId(chatId);
      }

      // 6. Обновляем кредиты
      const newCredits = (userData.credits || 0) - 1;
      await this.firestoreService.updateUserData(user.uid, { credits: newCredits });
      this.appState.updateCredits(newCredits);

      this.toastService.success('Image generated successfully!');
      
      // Images are consumed, no need to restore unless error/stop.
      this.lastAttachedImages = []; 

    } catch (error: any) {
      if (error.message === 'Generation cancelled' || error.name === 'AbortError') {
        this.toastService.info('Generation stopped');
        // Restore images on stop
        this.promptBoxImages = [...this.lastAttachedImages];
      } else {
        // Log full error to console for developers
        console.error('Full Generation Error:', error);
        
        // Show friendly user message in toast
        const friendlyMsg = this.getFriendlyErrorMessage(error);
        this.toastService.error(friendlyMsg);
        
        // Restore images on error
        this.promptBoxImages = [...this.lastAttachedImages];
      }
    } finally {
      this.abortController = null;
      this.appState.setIsGenerating(false);
    }
  }
}
