"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-40" />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold tracking-tight max-w-4xl"
        >
          AI-Powered Academic Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-6 max-w-2xl"
        >
          Smart regulation search, GPA prediction, semester planning,
          and risk analysis — all powered by advanced AI agents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex gap-4"
        >
          <Link
            href="/login"
            className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

          <Link
            href="#features"
            className="px-8 py-4 border border-white/20 rounded-xl hover:bg-white/10 transition"
          >
            Learn More
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-center mb-16"
        >
          Powerful AI Modules
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Regulation RAG Engine",
              desc: "Ask academic regulation questions instantly with semantic search.",
            },
            {
              title: "GPA Prediction",
              desc: "Forecast your academic performance before registration.",
            },
            {
              title: "Risk Analysis",
              desc: "Detect high-risk courses using AI-driven analytics.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-400 mt-4">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {["Upload Regulations", "AI Processes Data", "Students Get Insights"].map(
              (step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-6"
                >
                  <div className="text-4xl font-bold text-blue-500">
                    {i + 1}
                  </div>
                  <p className="mt-4 text-gray-300">{step}</p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-bold"
        >
          Transform Academic Decision Making
        </motion.h2>

        <Link
          href="/register"
          className="mt-8 inline-block px-10 py-5 bg-purple-600 rounded-2xl hover:bg-purple-700 transition"
        >
          Start Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-500 border-t border-white/10">
        © 2026 Academic AI Mentor — Built with Intelligence.
      </footer>
    </div>
  );
}