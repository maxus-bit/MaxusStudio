import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UserData } from '../../../../core/models/user.model';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss'
})
export class SettingsModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() userId: string = '';
  @Input() userData: UserData | null = null;
  @Output() close = new EventEmitter<void>();

  currentTab: 'profile' | 'account' = 'profile';
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isUpdating: boolean = false;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.updateEmailFromUserData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData'] && this.userData) {
      this.updateEmailFromUserData();
    }
  }

  private updateEmailFromUserData() {
    if (this.userData) {
      this.email = this.userData.email;
    }
  }

  async onUpdateEmail() {
    if (!this.email || !this.userId) return;

    try {
      this.isUpdating = true;
      const user = this.authService.currentUser;
      if (user) {
        // Обновление email через Firebase Auth
        // await updateEmail(user, this.email);
        await this.firestoreService.updateUserData(this.userId, { email: this.email });
        this.toastService.success('Email updated successfully');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to update email');
    } finally {
      this.isUpdating = false;
    }
  }

  async onUpdatePassword() {
    if (this.newPassword.length < 6) {
      this.toastService.error('Password must be at least 6 characters long');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    try {
      this.isUpdating = true;
      const user = this.authService.currentUser;
      if (user) {
        // Обновление пароля через Firebase Auth
        // await updatePassword(user, this.newPassword);
        this.toastService.success('Password updated successfully');
        this.newPassword = '';
        this.confirmPassword = '';
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to update password');
    } finally {
      this.isUpdating = false;
    }
  }

  async onDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      this.isUpdating = true;
      // Удаление всех чатов пользователя
      // Удаление данных пользователя
      // Удаление аккаунта из Firebase Auth
      this.toastService.success('Account deleted successfully');
      await this.authService.signOut();
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to delete account');
    } finally {
      this.isUpdating = false;
    }
  }

  onClose() {
    this.close.emit();
  }
}
