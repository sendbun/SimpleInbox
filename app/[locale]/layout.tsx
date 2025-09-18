import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocaleMessages, isValidLocale, defaultLocale, supportedLocales } from "@/lib/i18n-config"
import "../globals.css"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "TempMail - Free Temporary Email Service | Disposable Email Addresses",
  description: "Get free temporary email addresses instantly. Use our disposable email service to protect your privacy, avoid spam, and sign up for websites without revealing your real email. No registration required.",
  keywords: [
    "temporary email",
    "disposable email",
    "free email",
    "temp mail",
    "email generator",
    "privacy email",
    "spam protection",
    "anonymous email",
    "fake email",
    "email address generator",
    "temporary email address",
    "disposable email address",
    "free temporary email",
    "email privacy",
    "spam free email"
  ],
  authors: [{ name: "TempMail Team" }],
  creator: "TempMail",
  publisher: "TempMail",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tempmailo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "TempMail - Free Temporary Email Service",
    description: "Get free temporary email addresses instantly. Protect your privacy and avoid spam with our disposable email service. No registration required.",
    url: 'https://tempmailo.com',
    siteName: 'TempMail',
    images: [
      {
        url: '/placeholder-logo.png',
        width: 1200,
        height: 630,
        alt: 'TempMail - Free Temporary Email Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TempMail - Free Temporary Email Service',
    description: 'Get free temporary email addresses instantly. Protect your privacy and avoid spam.',
    images: ['/placeholder-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export function generateStaticParams() {
  return Array.from(supportedLocales).map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: paramLocale } = await params
  const locale = isValidLocale(paramLocale) ? paramLocale : defaultLocale
  const messages = getLocaleMessages(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            {children}
            <SiteFooter />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


