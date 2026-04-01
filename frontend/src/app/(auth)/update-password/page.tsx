// app/auth/update-password/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale, useLocaleRouter } from '@/components/providers/LocaleProvider';
import { getMessages } from '@/lib/i18n/messages';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { locale } = useLocale();
  const copy = getMessages(locale).auth;
  const router = useLocaleRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (error: any) {
      alert(error.message);
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
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#DAC0A3]/20">
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-[#102C57] mb-2">{copy.updatePassword}</h1>
              <p className="text-[#102C57]/60 mb-6">
                {copy.updatePasswordDescription}
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#102C57]/70 mb-2">
                    {copy.newPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#102C57]/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#F8F0E5] rounded-xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20 transition-all outline-none text-[#102C57]"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#102C57]/70 mb-2">
                    {copy.confirmNewPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#102C57]/40" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#F8F0E5] rounded-xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20 transition-all outline-none text-[#102C57]"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#102C57] text-[#F8F0E5] rounded-xl font-semibold disabled:opacity-50"
                >
                  {loading ? copy.updating : copy.updatePassword}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#102C57] mb-2">{copy.passwordUpdated}</h2>
              <p className="text-[#102C57]/60">
                {copy.redirectingDashboard}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
