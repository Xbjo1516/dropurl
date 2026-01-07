import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navber";
import { LanguageProvider } from "@/components/Language/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dropurl.vercel.app"),

  title: "DURL",
  description: "URL Link Verifying & SEO Audit System",

  applicationName: "DURL",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    type: "website",
    siteName: "DURL",
    title: "DURL",
    description: "URL Link Verifying & SEO Audit System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DURL – URL & SEO Audit",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "DURL",
    description: "URL Link Verifying & SEO Audit System",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="nord">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-100 text-base-content`}
      >
        <LanguageProvider>
          <Navbar />
          <div className="min-h-screen">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
