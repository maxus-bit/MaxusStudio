import { Injectable } from '@angular/core';
import { Auth, User, UserCredential, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged, reload, authState } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AppStateService } from '../state/app.state';
import { FirestoreService } from './firestore.service';

const SESSION_DURATION_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SESSION_TIMEOUT_MS = SESSION_DURATION_DAYS * MS_PER_DAY;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authCheckCompleteSubject = new BehaviorSubject<boolean>(false);
  public authCheckComplete$ = this.authCheckCompleteSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private appState: AppStateService,
    private firestoreService: FirestoreService
  ) {
    onAuthStateChanged(this.auth, async (user) => {
      try {
        if (user) {
          // --- SESSION TIMEOUT LOGIC ---
          const lastActive = localStorage.getItem('lastActiveTime');
          const now = Date.now();

          if (lastActive) {
            const lastActiveTime = parseInt(lastActive, 10);
            // Если прошло больше 3 дней с последнего захода
            if (now - lastActiveTime > SESSION_TIMEOUT_MS) {
              console.log('Session expired due to inactivity (> 3 days). Logging out.');
              await this.logout();
              return; // Прерываем выполнение, так как пользователь разлогинен
            }
          }

          // Если пользователь активен (зашел сейчас), обновляем таймер
          // Это "обнуляет" счетчик и дает еще 3 дня
          localStorage.setItem('lastActiveTime', now.toString());
          // -----------------------------

          // Проверяем email verification для email/password аккаунтов
          const isGoogleProvider = user.providerData?.some(provider => provider.providerId === 'google.com');
          
          if (!isGoogleProvider) {
            try {
              await reload(user);
            } catch (e) {
              console.error('Error reloading user data:', e);
            }
          }

          // Если пользователь залогинился (особенно через Google), нужно убедиться, что у него есть запись в Firestore
          if (isGoogleProvider) {
             try {
                await this.firestoreService.createUserData(user.uid, user.email || '');
             } catch (e) {
                console.error('Error creating user data:', e);
             }
          }

          this.currentUserSubject.next(user);
          this.appState.setUser(user);
        } else {
          // Пользователь вышел или сессия истекла
          localStorage.removeItem('lastActiveTime'); // Очищаем таймер
          this.currentUserSubject.next(null);
          this.appState.setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        this.currentUserSubject.next(null);
        this.appState.setUser(null);
      } finally {
        this.authCheckCompleteSubject.next(true);
      }
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get authState$(): Observable<User | null> {
    return authState(this.auth);
  }

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    // При явном входе тоже обновляем время (хотя onAuthStateChanged сработает тоже)
    localStorage.setItem('lastActiveTime', Date.now().toString());
    return credential;
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    if (credential.user) {
        await this.firestoreService.createUserData(credential.user.uid, email);
        await this.sendEmailVerification(credential.user);
        localStorage.setItem('lastActiveTime', Date.now().toString());
    }
    return credential;
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    if (credential.user) {
        await this.firestoreService.createUserData(credential.user.uid, credential.user.email || '');
        localStorage.setItem('lastActiveTime', Date.now().toString());
    }
    return credential;
  }

  async sendEmailVerification(user: User): Promise<void> {
    await sendEmailVerification(user);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('lastActiveTime');
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    await this.signOut();
  }
}
