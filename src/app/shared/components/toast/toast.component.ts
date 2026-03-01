import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'info' | 'success' | 'error';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  @Input() message: string = '';
  @Input() type: ToastType = 'info';
  @Input() visible: boolean = false;

  get icon(): string {
    switch (this.type) {
      case 'error':
        return 'fa-circle-exclamation';
      case 'success':
        return 'fa-circle-check';
      default:
        return 'fa-circle-info';
    }
  }
}