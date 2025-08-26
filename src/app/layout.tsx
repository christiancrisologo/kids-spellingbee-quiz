import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/mobile.css";
import "../styles/themes.css";
import { ThemeProvider } from "../contexts/theme-context";
import { SystemSettingsProvider } from "../contexts/system-settings-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seplling Bee App - Mobile-Friendly Math Practice",
  description: "A fun and interactive mobile-optimized Seplling Bee Application for kids to practice addition, subtraction, multiplication, division, and algebraic expressions with one-handed navigation",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spelling Bee Quiz" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full touch-manipulation bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider defaultTheme="system">
          <SystemSettingsProvider>
            {children}
          </SystemSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
