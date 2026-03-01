import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UIState {
  showAuthModal: boolean;
  showEmailVerificationModal: boolean;
  showPasswordResetModal: boolean;
  showSettingsModal: boolean;
  showSubscriptionExpiredModal: boolean;
  sidebarOpen: boolean;
  toastMessages: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
}

const initialState: UIState = {
  showAuthModal: false,
  showEmailVerificationModal: false,
  showPasswordResetModal: false,
  showSettingsModal: false,
  showSubscriptionExpiredModal: false,
  sidebarOpen: false,
  toastMessages: []
};

@Injectable({
  providedIn: 'root'
})
export class UIStateService {
  private stateSubject = new BehaviorSubject<UIState>(initialState);
  public state$: Observable<UIState> = this.stateSubject.asObservable();

  // Selectors
  get showAuthModal$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.showAuthModal));
  }

  get showSettingsModal$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.showSettingsModal));
  }

  get sidebarOpen$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.sidebarOpen));
  }

  get toastMessages$(): Observable<Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>> {
    return this.state$.pipe(map(state => state.toastMessages));
  }

  // Actions
  openAuthModal(): void {
    this.updateState({ showAuthModal: true });
  }

  closeAuthModal(): void {
    this.updateState({ showAuthModal: false });
  }

  openEmailVerificationModal(): void {
    this.updateState({ showEmailVerificationModal: true });
  }

  closeEmailVerificationModal(): void {
    this.updateState({ showEmailVerificationModal: false });
  }

  openPasswordResetModal(): void {
    this.updateState({ showPasswordResetModal: true });
  }

  closePasswordResetModal(): void {
    this.updateState({ showPasswordResetModal: false });
  }

  openSettingsModal(): void {
    this.updateState({ showSettingsModal: true });
  }

  closeSettingsModal(): void {
    this.updateState({ showSettingsModal: false });
  }

  openSubscriptionExpiredModal(): void {
    this.updateState({ showSubscriptionExpiredModal: true });
  }

  closeSubscriptionExpiredModal(): void {
    this.updateState({ showSubscriptionExpiredModal: false });
  }

  toggleSidebar(): void {
    const currentState = this.stateSubject.value;
    this.updateState({ sidebarOpen: !currentState.sidebarOpen });
  }

  closeSidebar(): void {
    this.updateState({ sidebarOpen: false });
  }

  addToast(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const id = Date.now().toString();
    const currentToasts = this.stateSubject.value.toastMessages;
    this.updateState({
      toastMessages: [...currentToasts, { id, message, type }]
    });

    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 3000);
  }

  removeToast(id: string): void {
    const currentToasts = this.stateSubject.value.toastMessages;
    this.updateState({
      toastMessages: currentToasts.filter(toast => toast.id !== id)
    });
  }

  private updateState(partialState: Partial<UIState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }
}

