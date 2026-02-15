export interface Subscription {
  id: string;
  userId: string;
  planType: 'basic' | 'pro' | 'ultra';
  billingPeriod: 'monthly' | 'annual';
  startDate: number;
  expiryDate: number;
  credits: number;
  status: 'active' | 'expired' | 'cancelled';
  stripeSubscriptionId?: string;
}

export interface Plan {
  id: 'basic' | 'pro' | 'ultra';
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  features: string[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'BASIC',
    description: 'Usually plan for you',
    monthlyPrice: 10,
    annualPrice: 102,
    credits: 80,
    features: [
      'Thumbnails',
      '80 Generations',
      'Latest Update',
      'All'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    description: 'Unlocks full power',
    monthlyPrice: 25,
    annualPrice: 255,
    credits: 200,
    features: [
      'Thumbnails Pro',
      '200 Generations',
      'Latest Update',
      'All'
    ],
    badge: 'Most Popular'
  },
  {
    id: 'ultra',
    name: 'ULTRA',
    description: 'Open ALL subscribe',
    monthlyPrice: 50,
    annualPrice: 510,
    credits: 1000,
    features: [
      'Thumbnails Pro',
      '1000 Generations',
      'Latest Update',
      'All'
    ]
  }
];

