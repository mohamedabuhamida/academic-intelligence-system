'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MailCheck } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getMessages } from '@/lib/i18n/messages';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).auth;

  return (
    <div className="min-h-screen bg-[#F8F0E5] flex items-center justify-center p-6">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Link
          href={localizePath('/login')}
          className="inline-flex items-center gap-2 text-[#102C57]/60 hover:text-[#102C57] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {copy.backToSignIn}
        </Link>

        <div className="rounded-[2rem] border border-[#DAC0A3]/20 bg-white p-10 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#102C57] text-[#F8F0E5] shadow-lg">
            <MailCheck className="h-10 w-10" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#102C57]">{copy.checkYourEmail}</h1>
            <p className="mt-4 text-[#102C57]/65 leading-7">
              {copy.verifyEmailDescription}
            </p>

            {email && (
              <div className="mt-6 rounded-2xl border border-[#DAC0A3]/20 bg-[#F8F0E5] px-4 py-3 text-[#102C57]">
                {email}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-dashed border-[#DAC0A3]/30 bg-[#FFFDF9] px-5 py-4 text-left text-sm text-[#102C57]/70">
              <p>{copy.verifyStep1}</p>
              <p>{copy.verifyStep2}</p>
              <p>{copy.verifyStep3}</p>
              <p className="mt-3 text-[#102C57]/55">{copy.verifyWaitHint}</p>
            </div>

            <div className="mt-8">
              <Link
                href={localizePath('/login')}
                className="inline-flex items-center justify-center rounded-xl bg-[#102C57] px-5 py-3 text-sm font-semibold text-[#F8F0E5]"
              >
                {copy.goToSignIn}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
