import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing-card.component.html',
  styleUrl: './pricing-card.component.scss'
})
export class PricingCardComponent {
  @Input() plan!: Plan;
  @Input() isAnnual: boolean = false;
  @Input() isPopular: boolean = false;
  @Output() selectPlan = new EventEmitter<Plan>();

  get price(): number {
    return this.isAnnual ? this.plan.annualPrice : this.plan.monthlyPrice;
  }

  get monthlyPrice(): number {
    if (this.isAnnual) {
      return Math.round((this.plan.annualPrice / 12) * 100) / 100;
    }
    return this.plan.monthlyPrice;
  }

  onSelect() {
    this.selectPlan.emit(this.plan);
  }
}

