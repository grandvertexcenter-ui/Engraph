import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IntroAnimation from "../components/IntroAnimation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ENGRAPH | Engineering Connected",
    template: "%s | ENGRAPH",
  },
  description:
    "ENGRAPH is an engineering network connecting innovators, engineers, researchers, and technology companies.",
  applicationName: "ENGRAPH",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ENGRAPH",
    statusBarStyle: "black-translucent",
  },
  keywords: [
    "ENGRAPH",
    "Engineering Network",
    "Engineering Innovation",
    "Technology",
    "Manufacturing",
    "Robotics",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b12",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IntroAnimation />
        {children}
      </body>
    </html>
  );
}