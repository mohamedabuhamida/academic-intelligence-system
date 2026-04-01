export const supportedLocales = ["en", "ar"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const defaultLocale: AppLocale = "en";
export const localeCookieName = "aether-locale";

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

export function localeDirection(locale: AppLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}
