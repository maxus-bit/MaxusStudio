import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-email-verification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification-modal.component.html',
  styleUrl: './email-verification-modal.component.scss'
})
export class EmailVerificationModalComponent {
  @Input() email: string = '';
  @Input() isNewUser: boolean = true;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() resendVerification = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  async onResendVerification() {
    try {
      // Для повторной отправки нужно войти снова
      // Это будет реализовано через отдельный сервис или компонент
      this.resendVerification.emit();
      this.toastService.info('Verification email will be sent again');
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to resend verification email');
    }
  }

  onClose() {
    this.close.emit();
  }
}

