// app/login/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Brain, Mail, Lock, ArrowRight, Sparkles, Github, Chrome } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale, useLocaleRouter } from '@/components/providers/LocaleProvider';
import { getMessages } from '@/lib/i18n/messages';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).auth;
  const router = useLocaleRouter();
  const supabase = createClient();

  const formatAuthError = (message: string) => {
    const normalized = message.toLowerCase();
    if (normalized.includes('email rate limit exceeded')) {
      return 'Too many email requests were sent recently. Please wait a few minutes and try again.';
    }
    return message;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}${localizePath('/auth/callback')}`,
          },
        });
        if (error) throw error;
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setErrorMessage(formatAuthError(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      setErrorMessage('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}${localizePath('/auth/callback')}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMessage(formatAuthError(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F0E5] flex">
      <div className="absolute right-6 top-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Left Side - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-[#102C57] relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#DAC0A3] rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#EADBC8] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#DAC0A3] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-[#F8F0E5]">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#DAC0A3] flex items-center justify-center">
              <Brain className="w-7 h-7 text-[#102C57]" />
            </div>
            <span className="text-3xl font-bold">Aether<span className="text-[#DAC0A3]">Academy</span></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold leading-tight mb-6"
          >
            {copy.welcomeTitle.split("\n")[0]}<br />{copy.welcomeTitle.split("\n")[1]}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#EADBC8] mb-12"
          >
            {copy.welcomeDescription}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {[
              copy.featureStudyPlans,
              copy.featureAnalytics,
              copy.featureTutoring,
              copy.featureCollaborative
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#DAC0A3]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#DAC0A3]" />
                </div>
                <span className="text-lg">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Auth Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Form Header */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-[#102C57] mb-2">
              {isSignUp ? copy.createAccount : copy.welcomeBack}
            </h2>
            <p className="text-[#102C57]/60">
              {isSignUp 
                ? copy.startJourney
                : copy.continueJourney}
            </p>
          </motion.div>

          {/* OAuth Buttons */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex gap-3 mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignIn('google')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-xl border border-[#DAC0A3]/20 text-[#102C57] hover:border-[#DAC0A3] transition-all shadow-sm"
            >
              <Chrome className="w-5 h-5" />
              <span className="text-sm font-medium">Google</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignIn('github')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-xl border border-[#DAC0A3]/20 text-[#102C57] hover:border-[#DAC0A3] transition-all shadow-sm"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub</span>
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="relative mb-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DAC0A3]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F0E5] text-[#102C57]/40">{copy.continueWithEmail}</span>
            </div>
          </motion.div>

          {/* Auth Form */}
          <motion.form 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            onSubmit={handleAuth}
            className="space-y-5"
          >
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
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20 transition-all outline-none text-[#102C57]"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#102C57]/70 mb-2">
                {copy.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#102C57]/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/20 transition-all outline-none text-[#102C57]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-right"
              >
                <Link 
                  href={localizePath('/auth/reset-password')}
                  className="text-sm text-[#102C57]/60 hover:text-[#102C57] transition-colors"
                >
                  {copy.forgotPassword}
                </Link>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#102C57] text-[#F8F0E5] rounded-xl font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? copy.processing : (isSignUp ? copy.createAccount : copy.signIn)}
              </span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />}
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['0%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.button>
          </motion.form>

          {/* Toggle Sign Up/Sign In */}
          <motion.p 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mt-8 text-center text-[#102C57]/60"
          >
            {isSignUp ? copy.alreadyHaveAccount : copy.dontHaveAccount}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#102C57] font-semibold hover:underline"
            >
              {isSignUp ? copy.signIn : copy.signUp}
            </button>
          </motion.p>

          {/* Academic Email Note */}
          <motion.p 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mt-6 text-xs text-center text-[#102C57]/40"
          >
            {copy.termsNote}<br/>
            {copy.academicEmailNote}
          </motion.p>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
