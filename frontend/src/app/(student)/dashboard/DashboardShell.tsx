"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Chat", href: "/dashboard/chat" },
    { name: "Planner", href: "/dashboard/planner" },
    { name: "GPA", href: "/dashboard/gpa" },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      
      {/* Sidebar */}
      <motion.div
        animate={{ width: collapsed ? 80 : 250 }}
        transition={{ duration: 0.4 }}
        className="bg-[#111827] border-r border-white/10 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between p-4">
          <motion.h1
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="text-lg font-semibold"
          >
            AI Mentor
          </motion.h1>
          <button onClick={() => setCollapsed(!collapsed)}>☰</button>
        </div>

        <nav className="mt-6 space-y-2 px-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  pathname === item.href
                    ? "bg-blue-600/30 border border-blue-500"
                    : "hover:bg-white/10"
                }`}
              >
                {collapsed ? item.name[0] : item.name}
              </motion.div>
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-lg"
        >
          <h2 className="text-xl font-semibold">
            {pathname.split("/").pop()}
          </h2>
          <div className="text-sm text-gray-400">
            {user.email}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="flex-1 p-8 overflow-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}