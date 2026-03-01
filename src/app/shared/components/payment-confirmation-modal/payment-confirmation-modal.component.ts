import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-payment-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-confirmation-modal.component.html',
  styleUrls: ['./payment-confirmation-modal.component.scss']
})
export class PaymentConfirmationModalComponent {
  @Input() visible: boolean = false;
  @Input() plan: PlanDetails | null = null;
  @Input() isAnnual: boolean = false;
  @Input() processing: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  get billingPeriod(): string {
    return this.isAnnual ? 'Yearly' : 'Monthly';
  }

  get periodShort(): string {
    return this.isAnnual ? '/year' : '/mo';
  }

  onClose() {
    if (!this.processing) {
      this.close.emit();
    }
  }

  onConfirm() {
    if (!this.processing) {
      this.confirm.emit();
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}