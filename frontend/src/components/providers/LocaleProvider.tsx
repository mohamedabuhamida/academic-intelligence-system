"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  AppLocale,
  defaultLocale,
  localeCookieName,
  localeDirection,
} from "@/lib/i18n/config";
import {
  localizePath as buildLocalizedPath,
  resolveLocale,
  stripLocalePrefix as stripLocalePathPrefix,
  switchLocalePath,
} from "@/lib/i18n/routing";

type LocaleContextValue = {
  locale: AppLocale;
  direction: "ltr" | "rtl";
  localizePath: (href: string) => string;
  stripLocalePrefix: (pathname: string) => string;
  switchLocalePath: (locale: AppLocale, pathname?: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const locale = useMemo(() => resolveLocale(pathname, defaultLocale), [pathname]);
  const direction = localeDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.dataset.locale = locale;
    document.cookie = `${localeCookieName}=${locale}; path=/; samesite=lax`;
  }, [direction, locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction,
      localizePath: (href: string) => buildLocalizedPath(href, locale),
      stripLocalePrefix: stripLocalePathPrefix,
      switchLocalePath: (nextLocale: AppLocale, currentPathname?: string) =>
        switchLocalePath(currentPathname ?? pathname, nextLocale),
    }),
    [direction, locale, pathname],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider.");
  }

  return context;
}

export function useLocaleRouter() {
  const router = useRouter();
  const { localizePath } = useLocale();

  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) =>
        router.push(localizePath(href), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
        router.replace(localizePath(href), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) =>
        router.prefetch(localizePath(href), options),
    }),
    [localizePath, router],
  );
}
