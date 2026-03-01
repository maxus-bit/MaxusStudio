import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, doc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
import { Plan, PLANS } from '../models/subscription.model';

export interface CheckoutSession {
  url?: string;
  error?: { message: string };
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private auth = inject(AuthService);

  // --- Configuration prices Stripe ---
  private readonly PRICE_IDS = {
    monthly: {
      basic: 'price_1SsKj73OhZaczFnLGEiyalX1', 
      pro: 'price_1SsKjZ3OhZaczFnLrPztPsTY', 
      ultra: 'price_1SsKjt3OhZaczFnLnlGe0mii'
    },
    annual: {
      basic: 'price_1SsKus3OhZaczFnLXHzLQUfE',
      pro: 'price_1SsKvM3OhZaczFnLEyjOznE9',
      ultra: 'price_1SsKwM3OhZaczFnLXsqzHNmO'
    }
  };

  constructor() {}

  getPlans(): Plan[] {
    return PLANS;
  }

  // --- Start checkout in Stripe ---
  async startCheckout(plan: 'basic' | 'pro' | 'ultra', billing: 'monthly' | 'annual'): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const priceId = this.PRICE_IDS[billing][plan];
    if (!priceId) throw new Error('Price ID not configured for this plan');

    // Create a new checkout session in Firestore
    const sessionsRef = collection(this.firestore, 'customers', user.uid, 'checkout_sessions');
    
    const docRef = await addDoc(sessionsRef, {
      price: priceId,
      success_url: window.location.origin + '/dashboard?success=true',
      cancel_url: window.location.origin + '/dashboard?canceled=true',
      allow_promotion_codes: true,
      mode: 'subscription'
    });

    // Listen for changes to the session document to get the Stripe checkout URL
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data() as CheckoutSession;
        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }
        if (data?.url) {
          unsubscribe();
          window.location.href = data.url; // Redirect to Stripe checkout
          resolve();
        }
      });
    });
  }

  // --- Open Stripe billing portal (Change cards and cancel sub...) ---
  async openBillingPortal(): Promise<void> {
    try {
      const createPortalSession = httpsCallable(this.functions, 'createPortalSession');
      const result: any = await createPortalSession({ 
        returnUrl: window.location.origin + '/dashboard' 
      });
      
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      throw error;
    }
  }
}