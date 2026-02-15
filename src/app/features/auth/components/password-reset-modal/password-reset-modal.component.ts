import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-reset-modal.component.html',
  styleUrl: './password-reset-modal.component.scss'
})
export class PasswordResetModalComponent {
  @Input() email: string = '';
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}

