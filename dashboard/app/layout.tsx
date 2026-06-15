import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Job Autofiller — AI-Powered Job Application Assistant",
  description: "Automate your job applications with AI. Auto-fill forms, generate cover letters, and track applications across 10+ job portals.",
  keywords: "job application, autofill, AI, resume, cover letter, job search automation",
  openGraph: {
    title: "Job Autofiller",
    description: "AI-powered job application automation platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
