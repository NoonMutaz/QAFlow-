import { SubscriptionPlan } from './types';

interface SubscriptionTabProps {
  plans: SubscriptionPlan[];
}

export default function SubscriptionTab({ plans }: SubscriptionTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-sm text-gray-500 mt-1">Upgrade to unlock more features for your team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-6 transition-all ${
              plan.current ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'
            }`}
          >
            {plan.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                Current Plan
              </span>
            )}
            {plan.badge && !plan.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payment processing coming soon. Plans are shown for preview purposes. <span className="text-red-500 text-xs ml-1">(Feature in development)</span>
        </p>
      </div>
    </div>
  );
}