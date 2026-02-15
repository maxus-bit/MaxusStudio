import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthModalComponent } from '../auth/components/auth-modal/auth-modal.component';
import { EmailVerificationModalComponent } from '../auth/components/email-verification-modal/email-verification-modal.component';
import { PasswordResetModalComponent } from '../auth/components/password-reset-modal/password-reset-modal.component';
import { SubscriptionService } from '../../core/services/subscription.service';
import { PaymentConfirmationModalComponent, PlanDetails } from '../../shared/components/payment-confirmation-modal/payment-confirmation-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    AuthModalComponent,
    EmailVerificationModalComponent,
    PasswordResetModalComponent,
    PaymentConfirmationModalComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  isAnnual: boolean = false;
  showAuthModal: boolean = false;
  showEmailVerificationModal: boolean = false;
  showPasswordResetModal: boolean = false;
  isMobileMenuOpen: boolean = false;
  
  verificationEmail: string = '';
  isNewUser: boolean = false;
  resetEmail: string = '';

  // Payment Modal state
  showPaymentModal: boolean = false;
  selectedPlan: PlanDetails | null = null;
  paymentProcessing: boolean = false;

  constructor(
    private viewportScroller: ViewportScroller,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {}

  scrollTo(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openAuthModal() {
    this.showAuthModal = true;
    this.isMobileMenuOpen = false;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  onEmailVerificationSent(event: { email: string; isNewUser: boolean }) {
    this.showAuthModal = false;
    this.verificationEmail = event.email;
    this.isNewUser = event.isNewUser;
    this.showEmailVerificationModal = true;
  }

  closeEmailVerificationModal() {
    this.showEmailVerificationModal = false;
    this.verificationEmail = '';
  }

  onPasswordResetSent(email: string) {
    this.showAuthModal = false;
    this.resetEmail = email;
    this.showPasswordResetModal = true;
  }

  closePasswordResetModal() {
    this.showPasswordResetModal = false;
    this.resetEmail = '';
  }

  toggleBilling() {
    // isAnnual updates automatically via ngModel
  }

  selectPlan(planId: string) {
    const plans = this.subscriptionService.getPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
      const price = this.isAnnual ? plan.annualPrice : plan.monthlyPrice;
      this.selectedPlan = {
          id: plan.id,
          name: plan.name,
          price: price
      };
      this.showPaymentModal = true;
    }
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedPlan = null;
    this.paymentProcessing = false;
  }

  confirmPayment() {
    if (!this.selectedPlan) return;
    
    this.paymentProcessing = true;
    
    // Имитация
    setTimeout(() => {
        console.log(`Processing payment for ${this.selectedPlan?.name}`);
        this.paymentProcessing = false;
        this.closePaymentModal();
        alert('Payment system integration pending. Plan: ' + this.selectedPlan?.name);
    }, 1500);
  }
}
