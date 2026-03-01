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
            // If the user has been inactive for more than the session timeout, log them out
            if (now - lastActiveTime > SESSION_TIMEOUT_MS) {
              console.log('Session expired due to inactivity (> 3 days). Logging out.');
              await this.logout();
              return; // End the function early since the user is now logged out
            }
          }

          // If the user is active, update the last active time
          localStorage.setItem('lastActiveTime', now.toString());

          // Check email verification for email/password accounts
          const isGoogleProvider = user.providerData?.some(provider => provider.providerId === 'google.com');
          
          if (!isGoogleProvider) {
            try {
              await reload(user);
            } catch (e) {
              console.error('Error reloading user data:', e);
            }
          }

          // If the user signed in with Google, we can skip email verification check
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
          // User is signed out, clear the session timer and update state
          localStorage.removeItem('lastActiveTime'); // Clean the timer
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
    // Update last active time on successful sign-in
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