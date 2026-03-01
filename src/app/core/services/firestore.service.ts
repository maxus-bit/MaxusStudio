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

  // Method to get user data once (e.g., on app initialization)
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

  // Observable for real-time updates to user data
  getUserData$(uid: string): Observable<UserData | null> {
    return new Observable(observer => {
      const userDocRef = doc(this.firestore, 'users', uid);
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as UserData;
          observer.next(userData);
          // Update the app state with the latest user data
          this.appState.setUserData(userData);
        } else {
          observer.next(null);
          this.appState.setUserData(null);
        }
      }, (error) => {
        console.error("Firestore user data listener error:", error);
        // observer.error(error);
      });
      return () => unsubscribe();
    });
  }

  // Create user data - in the new architecture, this is triggered by a Cloud Function onUserCreated.
  async createUserData(uid: string, email: string): Promise<void> {
    
    const userDocRef = doc(this.firestore, 'users', uid);
    
    try {
      
      const existingDoc = await getDoc(userDocRef);
      
      if (existingDoc.exists()) {
        await this.updateLastLogin(uid);
      } else {
        // Document does not exist, but we expect the Cloud Function to create it shortly.
          // We can either wait or just log and return.
        console.log("User document does not exist yet. Waiting for Cloud Function to create it.");
      }
    } catch (error) {

      console.warn("Operation restricted by security rules (likely expected):", error);
    }
  }

  // Update user data
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

  // Update last login time
  async updateLastLogin(uid: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await this.updateUserData(uid, { lastLogin: now } as Partial<UserData>);
    } catch (error) {
      console.warn("Failed to update last login (might be restricted):", error);
    }
  }

  // Method to get chat history for a user
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
      });
      return () => unsubscribe();
    });
  }

  // Create a new chat
  async createChat(uid: string, chat: Omit<Chat, 'id'>): Promise<string> {
    const chatsRef = collection(this.firestore, 'users', uid, 'chats');
    const chatData = {
      ...chat,
      timestamp: chat.createdAt || Date.now() 
    };
    const docRef = await addDoc(chatsRef, chatData);
    return docRef.id;
  }

  // Update chat metadata
  async updateChat(uid: string, chatId: string, data: Partial<Chat>): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await updateDoc(chatDocRef, {
      ...data,
      updatedAt: Date.now()
    });
  }

  // Delete a chat
  async deleteChat(uid: string, chatId: string): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await deleteDoc(chatDocRef);
  }

  // Get a specific chat by ID
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

  // Update chat messages
  async updateChatMessages(uid: string, chatId: string, messages: Chat['messages']): Promise<void> {
    const chatDocRef = doc(this.firestore, 'users', uid, 'chats', chatId);
    await updateDoc(chatDocRef, {
      messages,
      timestamp: new Date().toISOString(),
      updatedAt: Date.now()
    });
  }
}
