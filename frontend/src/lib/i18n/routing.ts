import { AppLocale, defaultLocale, isSupportedLocale } from "@/lib/i18n/config";

const EXTERNAL_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function extractLocaleFromPathname(pathname: string): AppLocale | undefined {
  const [firstSegment] = pathname.split("/").filter(Boolean);
  return isSupportedLocale(firstSegment) ? firstSegment : undefined;
}

export function resolveLocale(pathname: string, fallback: AppLocale = defaultLocale): AppLocale {
  return extractLocaleFromPathname(pathname) ?? fallback;
}

export function stripLocalePrefix(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (isSupportedLocale(segments[0])) {
    const stripped = `/${segments.slice(1).join("/")}`;
    return stripped === "/" ? "/" : stripped.replace(/\/+$/, "") || "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function localizePath(href: string, locale: AppLocale): string {
  if (!href || href.startsWith("#") || href.startsWith("?") || EXTERNAL_PROTOCOL_PATTERN.test(href)) {
    return href;
  }

  const [pathWithSearch, hash = ""] = href.split("#", 2);
  const [pathOnly, search = ""] = pathWithSearch.split("?", 2);
  const normalizedPath = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const barePath = stripLocalePrefix(normalizedPath);
  const localizedPath =
    locale === defaultLocale ? barePath : `${`/${locale}`}${barePath === "/" ? "" : barePath}`;

  return `${localizedPath}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

export function switchLocalePath(pathname: string, locale: AppLocale): string {
  return localizePath(stripLocalePrefix(pathname), locale);
}
