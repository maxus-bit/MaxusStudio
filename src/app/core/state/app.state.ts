import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { UserData } from '../models/user.model';
import { Chat } from '../models/chat.model';

// Interfaces
export interface AppState {
  user: User | null;
  userData: UserData | null;
  chats: Chat[];
  activeChatId: string | null;
  activeSection: 'home' | 'creations' | 'plans';
  isLoading: boolean;
  isGenerating: boolean;
  currentModel: 'v1' | 'v2';
}

// First initial state of the application
const initialState: AppState = {
  user: null,
  userData: null,
  chats: [],
  activeChatId: null,
  activeSection: 'home',
  isLoading: false,
  isGenerating: false,
  currentModel: 'v1'
};

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private stateSubject = new BehaviorSubject<AppState>(initialState);
  public state$: Observable<AppState> = this.stateSubject.asObservable();

  // Selectors for individual pieces of state
  get user$(): Observable<User | null> {
    return this.state$.pipe(map(state => state.user));
  }

  get userData$(): Observable<UserData | null> {
    return this.state$.pipe(map(state => state.userData));
  }

  get chats$(): Observable<Chat[]> {
    return this.state$.pipe(map(state => state.chats));
  }

  get activeChatId$(): Observable<string | null> {
    return this.state$.pipe(map(state => state.activeChatId));
  }

  get activeSection$(): Observable<'home' | 'creations' | 'plans'> {
    return this.state$.pipe(map(state => state.activeSection));
  }

  get isLoading$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.isLoading));
  }

  get isGenerating$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.isGenerating));
  }

  get currentModel$(): Observable<'v1' | 'v2'> {
    return this.state$.pipe(map(state => state.currentModel));
  }

  // Combined selectors for derived state
  get credits$(): Observable<number> {
    return this.userData$.pipe(
      map(userData => userData?.credits || 0)
    );
  }

  get isSubscriptionActive$(): Observable<boolean> {
    return this.userData$.pipe(
      map(userData => {
        if (!userData?.subscriptionExpiry) return false;
        return Date.now() < userData.subscriptionExpiry;
      })
    );
  }

  get activeChat$(): Observable<Chat | null> {
    return combineLatest([this.chats$, this.activeChatId$]).pipe(
      map(([chats, activeChatId]) => {
        if (!activeChatId) return null;
        return chats.find(chat => chat.id === activeChatId) || null;
      })
    );
  }

  // Getters for current state values
  get currentState(): AppState {
    return this.stateSubject.value;
  }

  get user(): User | null {
    return this.currentState.user;
  }

  get userData(): UserData | null {
    return this.currentState.userData;
  }

  get chats(): Chat[] {
    return this.currentState.chats;
  }

  get activeChatId(): string | null {
    return this.currentState.activeChatId;
  }

  get activeSection(): 'home' | 'creations' | 'plans' {
    return this.currentState.activeSection;
  }

  // Actions - methods to update the state
  setUser(user: User | null): void {
    this.updateState({ user });
  }

  setUserData(userData: UserData | null): void {
    this.updateState({ userData });
  }

  setChats(chats: Chat[]): void {
    this.updateState({ chats });
  }

  addChat(chat: Chat): void {
    const currentChats = this.currentState.chats;
    this.updateState({ chats: [chat, ...currentChats] });
  }

  updateChat(chatId: string, updates: Partial<Chat>): void {
    const currentChats = this.currentState.chats;
    const updatedChats = currentChats.map(chat =>
      chat.id === chatId ? { ...chat, ...updates } : chat
    );
    this.updateState({ chats: updatedChats });
  }

  removeChat(chatId: string): void {
    const currentChats = this.currentState.chats;
    this.updateState({ chats: currentChats.filter(chat => chat.id !== chatId) });
  }

  setActiveChatId(chatId: string | null): void {
    this.updateState({ activeChatId: chatId });
  }

  setActiveSection(section: 'home' | 'creations' | 'plans'): void {
    this.updateState({ activeSection: section });
  }

  setIsLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setIsGenerating(isGenerating: boolean): void {
    this.updateState({ isGenerating });
  }

  setCurrentModel(model: 'v1' | 'v2'): void {
    this.updateState({ currentModel: model });
  }

  updateCredits(credits: number): void {
    const currentUserData = this.currentState.userData;
    if (currentUserData) {
      this.updateState({
        userData: { ...currentUserData, credits }
      });
    }
  }

  // Private method to update the state with partial updates
  private updateState(partialState: Partial<AppState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }

  // Method to reset the state to initial values
  resetState(): void {
    this.stateSubject.next(initialState);
  }
}

