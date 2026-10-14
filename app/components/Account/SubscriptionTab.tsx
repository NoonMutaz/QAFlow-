'use client';

import { SubscriptionPlan } from './types';
import { useLanguage } from '../../i18n/LanguageProvider';

interface SubscriptionTabProps {
  plans: SubscriptionPlan[];
}

export default function SubscriptionTab({ plans }: SubscriptionTabProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100">{t("Select Enterprise Tier")}</h2>
        <p className="text-sm text-slate-400 mt-1">{t("Upgrade your plan to unlock advanced regulatory auditing tools")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 transition-all ${
              plan.current 
                ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' 
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            {plan.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full whitespace-nowrap">
                {t("Current Plan")}
              </span>
            )}
            {plan.badge && !plan.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-100">{t(plan.name)}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-100">{plan.price}</span>
                <span className="text-sm text-slate-400">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t(feature)}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                plan.current
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/50'
              }`}
            >
              {plan.current ? t('Active Plan') : t('Upgrade to {plan}', { plan: t(plan.name) })}
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl">
        <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("Enterprise procurement & payment integration coming soon.")}{" "}<span className="text-rose-400 text-xs ml-1">{t("(Feature in development)")}</span>
        </p>
      </div>
    </div>
  );
}