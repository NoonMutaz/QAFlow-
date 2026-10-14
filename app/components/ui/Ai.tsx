'use client';

import { useLanguage } from '../../i18n/LanguageProvider';

/**
 * "Imtithal AI" mark: the logo's hexagon with a gold spark inside.
 * Used everywhere the AI acts, so users recognise its suggestions at a glance.
 */
export function AiMark({ className = 'h-5 w-5', spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 1.8l8.8 5.1v10.2L12 22.2l-8.8-5.1V6.9L12 1.8z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        className={spin ? 'origin-center animate-pulse' : undefined}
        d="M12 6.8l1.25 3.45 3.45 1.25-3.45 1.25L12 16.2l-1.25-3.45L7.3 11.5l3.45-1.25L12 6.8z"
        fill="#d2a045"
      />
    </svg>
  );
}

/** Small pill that labels AI output: "Imtithal AI" / "ذكاء امتثال". */
export function AiBadge({ className = '', label }: { className?: string; label?: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-800 to-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ${className}`}
    >
      <AiMark className="h-3.5 w-3.5 text-brand-200" />
      {label ?? t('Imtithal AI')}
    </span>
  );
}

/** Loading line shown while the AI works. */
export function AiThinking({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-medium text-brand-700">
      <AiMark className="h-4 w-4 text-brand-600" spin />
      <span>{text}</span>
      <span className="flex gap-0.5" aria-hidden="true">
        <span className="h-1 w-1 animate-bounce rounded-full bg-gold-400 [animation-delay:-0.3s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gold-400 [animation-delay:-0.15s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gold-400" />
      </span>
    </p>
  );
}
