"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { fadeInScale } from "@/components/animations";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";

export default function DashboardResetPasswordPage() {
  const { locale } = useLocale();
  const authCopy = getMessages(locale).auth;
  const settingsCopy = getMessages(locale).settingsPage;
  const isArabic = locale === "ar";
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const ui = {
    pageTitle: isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password",
    pageDescription: isArabic
      ? "حدّث كلمة مرور حسابك من داخل لوحة التحكم."
      : "Update your account password from inside the dashboard.",
    passwordMismatch: isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.",
    requestFailed: isArabic ? "تعذر تحديث كلمة المرور." : "Could not update password.",
    successTitle: isArabic ? "تم تحديث كلمة المرور" : "Password updated",
    successDescription: isArabic
      ? "تم حفظ كلمة المرور الجديدة لحسابك بنجاح."
      : "Your new password has been saved successfully.",
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(ui.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.requestFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <motion.section
        variants={fadeInScale}
        className={`rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-[#102C57]/8 px-3 py-1 text-xs font-semibold text-[#102C57]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {ui.pageTitle}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[#102C57]">{ui.pageTitle}</h1>
        <p className="mt-2 max-w-3xl text-[#102C57]/65">{ui.pageDescription}</p>
      </motion.section>

      <motion.section
        variants={fadeInScale}
        className={`max-w-2xl rounded-2xl border border-[#DAC0A3]/25 bg-white/85 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        {!success ? (
          <>
            <h2 className="text-xl font-semibold text-[#102C57]">{settingsCopy.resetPassword}</h2>
            <p className="mt-2 text-sm leading-7 text-[#102C57]/70">{authCopy.updatePasswordDescription}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#102C57]/70">{authCopy.newPassword}</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#102C57]/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] py-3 pl-12 pr-4 text-[#102C57] outline-none transition-all focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20"
                    placeholder="********"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#102C57]/70">{authCopy.confirmNewPassword}</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#102C57]/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] py-3 pl-12 pr-4 text-[#102C57] outline-none transition-all focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20"
                    placeholder="********"
                  />
                </div>
              </label>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-3 font-semibold text-[#F8F0E5] disabled:opacity-60"
              >
                <ShieldCheck className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                {loading ? authCopy.updating : authCopy.updatePassword}
              </motion.button>
            </form>
          </>
        ) : (
          <div className={`py-8 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#102C57]">{ui.successTitle}</h2>
            <p className="mt-2 text-[#102C57]/70">{ui.successDescription}</p>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
