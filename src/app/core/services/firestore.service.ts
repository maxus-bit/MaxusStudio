import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserData } from '../models/user.model';
import { Chat } from '../models/chat.model';
import { AppStateService } from '../state/app.state';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(
    private firestore: Firestore,
    private appState: AppStateService
  ) {}

  // Методы из dashboard.js - получение данных пользователя
  async getUserData(uid: string): Promise<UserData | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Observable для отслеживания данных пользователя в реальном времени
  getUserData$(uid: string): Observable<UserData | null> {
    return new Observable(observer => {
      const userDocRef = doc(this.firestore, 'users', uid);
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as UserData;
          observer.next(userData);
          // Обновляем состояние приложения
          this.appState.setUserData(userData);
        } else {
          observer.next(null);
          this.appState.setUserData(null);
        }
      }, (error) => {
        console.error("Firestore user data listener error:", error);
        // Не пробрасываем ошибку дальше, чтобы не ломать UI, просто логируем
        // observer.error(error); 
      });
      return () => unsubscribe();
    });
  }

  // Создание данных пользователя при первом входе
  async createUserData(uid: string, email: string): Promise<void> {
    // В новой архитектуре создание пользователя осуществляется через Cloud Function onUserCreated.
    // Клиентский код просто ждет создания документа или обновляет lastLogin, если пользователь уже существует.
    
    const userDocRef = doc(this.firestore, 'users', uid);
    
    try {
      // Попытка получить документ.
      // Если он есть - отлично, обновляем lastLogin (если позволяет security rule).
      // Если нет - ждем пока создаст Cloud Function или ничего не делаем,
      // так как security rules теперь запрещают клиенту создавать пользователя (allow create: if false).
      
      const existingDoc = await getDoc(userDocRef);
      
      if (existingDoc.exists()) {
        await this.updateLastLogin(uid);
      } else {
        // Документа нет, и клиент не может его создать.
        // Cloud Function должна была сработать на создание Auth User.
        // Здесь можно добавить небольшую задержку и ретрай, если нужно, но обычно это не требуется,
        // так как подписка getUserData$ сама получит данные, когда они появятся.
        console.log("User document does not exist yet. Waiting for Cloud Function to create it.");
      }
    } catch (error) {
      // Игнорируем ошибки прав доступа, так как мы могли попытаться записать что-то, что нельзя
      console.warn("Operation restricted by security rules (likely expected):", error);
    }
  }

  // Обновление данных пользователя
  // Используем setDoc с merge: true вместо updateDoc, чтобы избежать ошибок "No document to update"
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    try {
      await setDoc(userDocRef, {
        ...data,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }

  // Обновление времени последнего входа
  async updateLastLogin(uid: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await this.updateUserData(uid, { lastLogin: now } as Partial<UserData>);
    } catch (error) {
      // Это может быть ошибкой прав доступа, если мы запретили обновление некоторых полей
      console.warn("Failed to update last login (might be restricted):", error);
    }
  }

  // Методы из dashboard.js - работа с чатами
  getChatHistory$(uid: string): Observable<Chat[]> {
    return new Observable(observer => {
      const chatsRef = collection(this.firestore, 'users', uid, 'chats');
      const q = query(chatsRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats: Chat[] = [];
        snapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() } as Chat);
        });
        observer.next(chats);
        this.appState.setChats(chats);
      }, (error) => {
        console.error("Firestore chat history listener error:", error);
        // Здесь ошибка может быть из-за отсутствия индекса или прав.
        // Если прав нет, ничего не поделаешь, но если индекс - его надо создать.
      });
      return () => unsubscribe();
    });
  }

  // Создание нового чата
  async createChat(uid: string, chat: Omit<Chat, 'id'>): Promise<string> {
    const chatsRef = collection(this.firestore, 'users', uid, 'chats');
    const chatData = {
      ...chat,
      timestamp: chat.createdAt || Date.now() 
    };
    const docRef = await addDoc(chatsRef, chatData);
    return docRef.id;
  }

  // Обновление чата
  async updateChat(uid: string, chatId: string, data: Partial<Chat>): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await updateDoc(chatDocRef, {
      ...data,
      updatedAt: Date.now()
    });
  }

  // Удаление чата
  async deleteChat(uid: string, chatId: string): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await deleteDoc(chatDocRef);
  }

  // Получение конкретного чата
  getChat$(uid: string, chatId: string): Observable<Chat | null> {
    return new Observable(observer => {
      const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
      const unsubscribe = onSnapshot(chatDocRef, (snapshot) => {
        if (snapshot.exists()) {
          observer.next({ id: snapshot.id, ...snapshot.data() } as Chat);
        } else {
          observer.next(null);
        }
      });
      return () => unsubscribe();
    });
  }

  // Обновление сообщений в чате
  async updateChatMessages(uid: string, chatId: string, messages: Chat['messages']): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await updateDoc(chatDocRef, {
      messages,
      timestamp: new Date().toISOString(),
      updatedAt: Date.now()
    });
  }
}
