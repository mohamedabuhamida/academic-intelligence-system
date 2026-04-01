// app/auth/reset-password/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getMessages } from '@/lib/i18n/messages';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).auth;
  const supabase = createClient();

  const formatResetError = (message: string) => {
    const normalized = message.toLowerCase();
    if (normalized.includes('email rate limit exceeded')) {
      return 'Too many reset emails were requested recently. Please wait a few minutes and try again.';
    }
    return message;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}${localizePath('/auth/update-password')}`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      setErrorMessage(formatResetError(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F0E5] flex items-center justify-center p-6">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link 
          href={localizePath('/login')}
          className="inline-flex items-center gap-2 text-[#102C57]/60 hover:text-[#102C57] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {copy.backToSignIn}
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#DAC0A3]/20">
          {!submitted ? (
            <>
              <h1 className="text-2xl font-bold text-[#102C57] mb-2">{copy.resetPassword}</h1>
              <p className="text-[#102C57]/60 mb-6">
                {copy.resetDescription}
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#102C57]/70 mb-2">
                    {copy.emailAddress}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#102C57]/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#F8F0E5] rounded-xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20 transition-all outline-none text-[#102C57]"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#102C57] text-[#F8F0E5] rounded-xl font-semibold flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? copy.sending : copy.sendResetLink}
                  {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-[#102C57] text-[#F8F0E5] flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#102C57] mb-2">{copy.checkYourEmail}</h2>
              <p className="text-[#102C57]/60">
                {copy.resetEmailSent}<br />
                <span className="font-medium text-[#102C57]">{email}</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
