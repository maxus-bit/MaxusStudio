import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat.model';

// State management for individual chat sessions
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  isGenerating: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private chatStates = new Map<string, BehaviorSubject<ChatState>>();

  getChatState$(chatId: string): Observable<ChatState> {
    if (!this.chatStates.has(chatId)) {
      this.chatStates.set(chatId, new BehaviorSubject<ChatState>(initialChatState));
    }
    return this.chatStates.get(chatId)!.asObservable();
  }

  getChatState(chatId: string): ChatState {
    if (!this.chatStates.has(chatId)) {
      return initialChatState;
    }
    return this.chatStates.get(chatId)!.value;
  }

  setMessages(chatId: string, messages: ChatMessage[]): void {
    this.updateChatState(chatId, { messages });
  }

  addMessage(chatId: string, message: ChatMessage): void {
    const currentState = this.getChatState(chatId);
    this.updateChatState(chatId, {
      messages: [...currentState.messages, message]
    });
  }

  setIsLoading(chatId: string, isLoading: boolean): void {
    this.updateChatState(chatId, { isLoading });
  }

  setIsGenerating(chatId: string, isGenerating: boolean): void {
    this.updateChatState(chatId, { isGenerating });
  }

  setError(chatId: string, error: string | null): void {
    this.updateChatState(chatId, { error });
  }

  clearChat(chatId: string): void {
    if (this.chatStates.has(chatId)) {
      this.chatStates.get(chatId)!.next(initialChatState);
    }
  }

  removeChat(chatId: string): void {
    this.chatStates.delete(chatId);
  }

  private updateChatState(chatId: string, partialState: Partial<ChatState>): void {
    if (!this.chatStates.has(chatId)) {
      this.chatStates.set(chatId, new BehaviorSubject<ChatState>(initialChatState));
    }
    const currentState = this.chatStates.get(chatId)!.value;
    const newState = { ...currentState, ...partialState };
    this.chatStates.get(chatId)!.next(newState);
  }
}