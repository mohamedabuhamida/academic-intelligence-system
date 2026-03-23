import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aether-academy.app"),
  title: {
    default: "Aether Academy",
    template: "%s | Aether Academy",
  },
  description:
    "Aether Academy is an academic intelligence platform for planning semesters, tracking progress, projecting GPA, and getting AI-powered study support.",
  applicationName: "Aether Academy",
  keywords: [
    "Aether Academy",
    "academic intelligence",
    "student dashboard",
    "GPA calculator",
    "semester planner",
    "study assistant",
  ],
  openGraph: {
    title: "Aether Academy",
    description:
      "Plan smarter semesters, track academic progress, and use AI-powered tools built for students.",
    siteName: "Aether Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether Academy",
    description:
      "Plan smarter semesters, track academic progress, and use AI-powered tools built for students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
