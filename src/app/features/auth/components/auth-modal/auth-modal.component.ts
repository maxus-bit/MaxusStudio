import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() emailVerificationSent = new EventEmitter<{ email: string; isNewUser: boolean }>();
  @Output() passwordResetSent = new EventEmitter<string>();

  currentStep: 'email' | 'password' = 'email';
  email: string = '';
  password: string = '';
  isProcessing: boolean = false;
  showForgotPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async onGoogleSignIn() {
    try {
      this.isProcessing = true;
      const credential = await this.authService.signInWithGoogle();
      const user = credential.user;
      
      try {
        await this.firestoreService.updateLastLogin(user.uid);
      } catch (e) {
        console.warn("Update last login failed", e);
      }

      this.toastService.success('Successfully signed in with Google!');
      this.close.emit();
      this.openDashboard();
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      this.toastService.error(error.message || 'Google sign-in failed');
    } finally {
      this.isProcessing = false;
    }
  }

  async onEmailContinue() {
    if (!this.email.includes('@')) {
      this.toastService.error('Please enter a valid email address');
      return;
    }
    this.currentStep = 'password';
  }

  async onAuthAction() {
    if (this.password.length < 6) {
      this.toastService.error('Password must be at least 6 characters long');
      return;
    }

    this.isProcessing = true;

    try {
      const credential = await this.authService.signUpWithEmail(this.email, this.password);
      const user = credential.user;
      
      await this.authService.signOut();
      this.emailVerificationSent.emit({ email: this.email, isNewUser: true });
      this.close.emit();
      
    } catch (createError: any) {
      if (createError.code === 'auth/email-already-in-use') {
        try {
          const credential = await this.authService.signInWithEmail(this.email, this.password);
          const user = credential.user;

          if (!user.emailVerified) {
            await this.authService.signOut();
            this.emailVerificationSent.emit({ email: this.email, isNewUser: false });
            this.close.emit();
            return;
          }

          try {
             const userData = await this.firestoreService.getUserData(user.uid);
             if (!userData) {
               await this.firestoreService.createUserData(user.uid, user.email || '');
             } else {
               await this.firestoreService.updateLastLogin(user.uid);
             }
          } catch (userDataError) {
             console.error("Error checking/creating user data on login:", userDataError);
          }

          this.toastService.success('Successfully signed in!');
          this.close.emit();
          this.openDashboard();
          
        } catch (loginError: any) {
          if (loginError.code === 'auth/wrong-password' || loginError.code === 'auth/invalid-credential') {
            this.toastService.error('Incorrect password. Please try again.');
          } else if (loginError.code === 'auth/user-not-found') {
            this.toastService.error('No account found with this email address.');
          } else if (loginError.code === 'auth/too-many-requests') {
            this.toastService.error('Too many failed login attempts. Please try again later.');
          } else {
            console.error("Login Error:", loginError);
            this.toastService.error(loginError.message || 'Login failed');
          }
        }
      } else {
        console.error("Registration Error:", createError);
        this.toastService.error(createError.message || 'Registration failed');
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async onForgotPassword() {
    if (!this.email) {
      this.toastService.error('Please enter your email address first');
      return;
    }

    try {
      await this.authService.sendPasswordResetEmail(this.email);
      this.passwordResetSent.emit(this.email);
      this.close.emit();
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to send password reset email');
    }
  }

  onBack() {
    this.currentStep = 'email';
    this.password = '';
  }

  onEmailKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onEmailContinue();
    }
  }

  private openDashboard() {
    const newTab = window.open('/dashboard', '_blank');
    if (!newTab) {
       // Если блокировщик всплывающих окон заблокировал открытие вкладки,
       // переходим в текущей вкладке.
       this.router.navigate(['/dashboard']);
    }
  }
}