export interface User {
  name?: string;
  email?: string;
}

export interface Bug {
  status: string;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  badge: string;
  features: string[];
  cta: string;
  tone: string;
  current: boolean;
  priceId: string;
}