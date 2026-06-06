import { SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Starter',
    price: '$0',
    priceId: 'price_free_forever', // معرف بوابة الدفع (مجاني)
    period: 'forever',
    badge: '',
    tone: 'For trying QAFlow',
    current: true,
    features: [
      'Track bugs in 2 projects max',
      'Up to 50 active bugs',
      'Simple status workflow',
      'Clean, distraction-free UI'
    ],
    limits: {
      maxProjects: 2,
      maxBugs: 50,
      maxMembers: 1, // الباقة المجانية للمطور المستقل فقط بدون دعوات
      hasSmartAlerts: false, // ميزة منع التكرار مقفولة هنا
      hasAnalytics: false
    }
  },
  {
    name: 'Builder',
    price: '$12',
    priceId: 'price_builder_monthly', // يُربط بـ Stripe Product ID لاحقاً
    period: 'per month',
    badge: 'Most Popular',
    tone: 'For serious developers',
    current: false,
    features: [
      'Unlimited projects & bugs',
      'Smart duplicate detection (Similarity Alert)', // ميزتك القاتلة مفعلة هنا!
      'Advanced search & filters (Fuse.js)',
      'Priority & workflow control',
      'Basic analytics (Bug trends & charts)'
    ],
    limits: {
      maxProjects: 9999,
      maxBugs: 99999,
      maxMembers: 1, // مخصصة للمطور المستقل المحترف
      hasSmartAlerts: true, // تفعيل التنبيه الذكي للمنع
      hasAnalytics: true
    }
  },
  {
    name: 'Team',
    price: '$40',
    priceId: 'price_team_monthly',
    period: 'per month',
    badge: 'Best Value',
    tone: 'For small teams shipping fast',
    current: false,
    features: [
      'Everything in Builder plan',
      'Team collaboration & organization setup', // تفعيل الـ Workspace الجماعي لـ مديرك وفريقك
      'Advanced roles management (Owner / Member / Viewer)', // التحكم بالصلاحيات المشروحة في الكنترولر
      'Full Project Activity Logs Timeline', // صفحة الـ Logs والـ Timeline كاملة
      'Attachments, screenshots & shared dashboards'
    ],
    limits: {
      maxProjects: 9999,
      maxBugs: 99999,
      maxMembers: 20, // يدعم حتى 20 مستخدم في المنظمة أو الفريق
      hasSmartAlerts: true,
      hasAnalytics: true
    }
  }
];