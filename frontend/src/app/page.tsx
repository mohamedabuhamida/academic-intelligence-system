// app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  Shield,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F0E5]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#F8F0E5]/80 backdrop-blur-xl border-b border-[#DAC0A3]/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#102C57] flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#F8F0E5]" />
              </div>
              <span className="text-xl font-semibold text-[#102C57]">
                Aether<span className="text-[#DAC0A3]">Academy</span>
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Solutions", "Pricing"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="text-[#102C57]/70 hover:text-[#102C57] transition-colors text-sm font-medium"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-[#102C57] hover:text-[#102C57]/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-[#102C57]/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="px-4 py-2 bg-[#DAC0A3]/20 rounded-full text-sm font-medium text-[#102C57] inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered Academic Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-7xl font-bold text-[#102C57] mb-6 leading-tight"
            >
              Transform Your
              <span className="text-[#DAC0A3] block">Learning Journey</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-[#102C57]/70 mb-12 max-w-2xl mx-auto"
            >
              Experience the future of education with AI-powered analytics,
              personalized study plans, and intelligent insights.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 30px -10px rgba(16,44,87,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#102C57] text-[#F8F0E5] rounded-2xl text-lg font-semibold flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-[#DAC0A3] text-[#102C57] rounded-2xl text-lg font-semibold w-full sm:w-auto"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F0E5] via-transparent to-transparent z-10" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#DAC0A3]/20">
              <img
                src="/api/placeholder/1200/600"
                alt="Dashboard Preview"
                className="w-full h-auto"
              />
              {/* Glass overlay effect */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#F8F0E5]/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-[#EADBC8]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-[#102C57] mb-4"
            >
              Intelligence That Adapts to You
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-[#102C57]/60 max-w-2xl mx-auto"
            >
              Powered by advanced AI to understand your learning patterns
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Study Assistant",
                description:
                  "24/7 intelligent support for your academic questions",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Smart Planning",
                description:
                  "Personalized study schedules that adapt to your progress",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Predictive Analytics",
                description:
                  "Forecast your academic performance with precision",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-[#DAC0A3] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative p-8 bg-[#F8F0E5] rounded-3xl border border-[#DAC0A3]/20">
                  <div className="w-16 h-16 rounded-2xl bg-[#102C57] text-[#F8F0E5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-[#102C57] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#102C57]/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-[#F8F0E5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                value: "98%",
                label: "Accuracy Rate",
                icon: <Shield className="w-6 h-6" />,
              },
              {
                value: "50K+",
                label: "Active Students",
                icon: <BookOpen className="w-6 h-6" />,
              },
              {
                value: "24/7",
                label: "AI Support",
                icon: <Brain className="w-6 h-6" />,
              },
              {
                value: "15min",
                label: "Avg. Response",
                icon: <Sparkles className="w-6 h-6" />,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#102C57]/10 text-[#102C57] flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#102C57] mb-2">
                  {stat.value}
                </div>
                <div className="text-[#102C57]/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#102C57]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8F0E5] mb-6">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-xl text-[#F8F0E5]/80 mb-10">
            Join thousands of students who have already elevated their learning
            experience
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-[#DAC0A3] text-[#102C57] rounded-2xl text-lg font-semibold inline-flex items-center gap-2 group"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#102C57] border-t border-[#DAC0A3]/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#DAC0A3] flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#102C57]" />
              </div>
              <span className="text-xl font-semibold text-[#F8F0E5]">
                AetherAcademy
              </span>
            </div>
            <div className="flex gap-8">
              {["Terms", "Privacy", "Contact"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="text-[#F8F0E5]/60 hover:text-[#F8F0E5] transition-colors text-sm"
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="text-sm text-[#F8F0E5]/40">
              © 2024 AetherAcademy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
