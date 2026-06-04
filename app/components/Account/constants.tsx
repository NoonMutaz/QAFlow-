import { SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    badge: '',
    features: ['Track bugs in 2 project', 'Up to 50 bugs', 'Simple status workflow', 'Clean, distraction-free UI'],
    cta: 'Start for free',
    tone: 'For trying QAFlow',
    current: true,
  },
  {
    name: 'Builder',
    price: '$12',
    period: 'per month',
    badge: 'Most Popular',
    features: ['Unlimited projects & bugs', 'Smart duplicate detection', 'Advanced search & filters', 'Priority & workflow control', 'Basic analytics (bug trends)'],
    cta: 'Upgrade to Builder',
    tone: 'For serious developers',
    current: false,
  },
  {
    name: 'Team',
    price: '$40',
    period: 'per month',
    badge: '',
    features: ['Team collaboration', 'Roles (QA / Dev / Admin)', 'Comments & activity tracking', 'Attachments & screenshots', 'Shared dashboards'],
    cta: 'Start with your team',
    tone: 'For small teams shipping fast',
    current: false,
  },
];