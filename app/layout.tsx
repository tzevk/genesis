import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackupSync } from "@/components/BackupSync";
import { QuizProvider } from "@/lib/quiz-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2A6BB5",
};

export const metadata: Metadata = {
  title: "Engineering Simulation Platform",
  description: "A gamified engineering simulation platform for learning EPC domain concepts",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GENESIS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="touch-scroll">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "pan-x pan-y",
        }}
      >
        <QuizProvider>
          <BackupSync />
          {children}
        </QuizProvider>
      </body>
    </html>
  );
}
