export interface User {
  name?: string;
  email?: string;
}

export interface Bug {
  status: string;
}
export interface PlanLimits {
  maxProjects: number;
  maxBugs: number;
  maxMembers: number;
  hasSmartAlerts: boolean;
  hasAnalytics: boolean;
}

// 2. التعريف الكامل لواجهة خطة الاشتراك المطابقة لملف الثوابت (constants)
export interface SubscriptionPlan {
  name: string;
  price: string;
  priceId: string;
  period: string;
  badge: string;
  tone: string;
  current: boolean;
  features: string[];
  limits: PlanLimits; //    (Object)  
}