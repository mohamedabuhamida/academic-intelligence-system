"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useLocale } from "@/components/providers/LocaleProvider";
import { AppLocale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
};

const localeOptions: Array<{ value: AppLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ar", label: "AR" },
];

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { locale, switchLocalePath } = useLocale();

  const handleSwitch = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    const query = searchParams.toString();
    const targetPath = switchLocalePath(nextLocale, pathname);

    router.push(query ? `${targetPath}?${query}` : targetPath);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-[#DAC0A3]/20 bg-white/80 p-1 shadow-sm ${className}`.trim()}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F0E5] text-[#102C57]">
        <Languages className="h-4 w-4" />
      </div>

      {localeOptions.map((option) => {
        const isActive = option.value === locale;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSwitch(option.value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              isActive
                ? "bg-[#102C57] text-[#F8F0E5]"
                : "text-[#102C57]/65 hover:bg-[#F8F0E5] hover:text-[#102C57]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
