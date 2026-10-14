import React from "react";

type IconProps = { className?: string };

const base = { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" } as const;

export const ChevronIcon = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

export const FileIcon = ({ className }: IconProps) => (
  <svg className={className} {...base} strokeWidth={2.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const UploadIcon = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const PlayIcon = ({ className }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
  </svg>
);

export const CalendarIcon = ({ className }: IconProps) => (
  <svg className={className} {...base}>
    <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={2} />
    <path strokeLinecap="round" strokeWidth={2} d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);
