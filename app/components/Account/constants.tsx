import { SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Starter Compliance',
    price: '$0',
    priceId: 'price_free_forever',
    period: 'forever',
    badge: '',
    tone: 'For initial inspection pilot',
    current: true,
    features: [
      'Track non-conformities in 2 audits max',
      'Up to 50 active inspection findings',
      'Basic approval & verification workflow',
      'Clean, governance-ready interface'
    ],
    limits: {
      maxProjects: 2,
      maxBugs: 50,
      maxMembers: 1,
      hasSmartAlerts: false,
      hasAnalytics: false
    }
  },
  {
    name: 'Standard Governance',
    price: '$12',
    priceId: 'price_builder_monthly',
    period: 'per month',
    badge: 'Most Popular',
    tone: 'For dedicated compliance officers',
    current: false,
    features: [
      'Unlimited audits & compliance findings',
      'Smart duplicate requirement alerts (Similarity Detection)',
      'Advanced standard search & regulatory filter',
      'Priority resolution & status control',
      'Basic compliance trend analytics'
    ],
    limits: {
      maxProjects: 9999,
      maxBugs: 99999,
      maxMembers: 1,
      hasSmartAlerts: true,
      hasAnalytics: true
    }
  },
  {
    name: 'Enterprise Audit',
    price: '$40',
    priceId: 'price_team_monthly',
    period: 'per month',
    badge: 'Best Value',
    tone: 'For complete organization oversight',
    current: false,
    features: [
      'Everything in Standard Governance plan',
      'Multi-department & workspace collaboration',
      'Granular roles (Auditor / Inspector / Reviewer)',
      'Full Audit Activity Logs & Compliance Timeline',
      'Evidentiary attachments, reports & executive dashboards'
    ],
    limits: {
      maxProjects: 9999,
      maxBugs: 99999,
      maxMembers: 20,
      hasSmartAlerts: true,
      hasAnalytics: true
    }
  }
];