// Shared by the server layout and the client provider, so it must not live in a 'use client' file.

export type Lang = 'en' | 'ar';

/** Cookie the root layout reads, so the server renders the right language and direction. */
export const LANG_COOKIE = 'lang';
