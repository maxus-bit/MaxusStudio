import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-expired-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-expired-modal.component.html',
  styleUrl: './subscription-expired-modal.component.scss'
})
export class SubscriptionExpiredModalComponent {
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() goToPlans = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onGoToPlans() {
    this.goToPlans.emit();
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}

