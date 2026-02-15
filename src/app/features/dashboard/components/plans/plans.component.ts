import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { Plan } from '../../../../core/models/subscription.model';
import { PricingCardComponent } from '../../../../shared/components/pricing-card/pricing-card.component';
import { PaymentConfirmationModalComponent, PlanDetails } from '../../../../shared/components/payment-confirmation-modal/payment-confirmation-modal.component';
// Удаляем старый ModalComponent, если он больше не нужен для других целей
// import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, PricingCardComponent, PaymentConfirmationModalComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss'
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  isAnnual: boolean = false;
  
  // Modal state
  showPaymentModal: boolean = false;
  selectedPlan: PlanDetails | null = null;
  paymentProcessing: boolean = false;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit() {
    this.plans = this.subscriptionService.getPlans();
  }

  toggleBilling() {
    // isAnnual уже обновляется через ngModel в шаблоне
  }

  onPlanSelected(plan: Plan) {
    const price = this.isAnnual ? plan.annualPrice : plan.monthlyPrice;
    
    // Преобразуем в PlanDetails для модалки
    this.selectedPlan = {
      id: plan.id,
      name: plan.name,
      price: price
    };
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedPlan = null;
    this.paymentProcessing = false;
  }

  confirmPayment() {
    if (!this.selectedPlan) return;
    
    this.paymentProcessing = true;
    
    // В реальном приложении здесь будет вызов API для создания сессии Stripe
    // Используем functions/index.js -> createPortalSession (или checkoutSession)
    
    // Имитация задержки
    setTimeout(() => {
        console.log(`Processing payment for ${this.selectedPlan?.name}`);
        this.paymentProcessing = false;
        this.closePaymentModal();
        alert('Payment integration pending. Selected plan: ' + this.selectedPlan?.name);
    }, 1500);
  }
}
