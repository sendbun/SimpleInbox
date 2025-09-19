"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { locales, languageNames } from "@/lib/i18n-config"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"

export function SiteFooter() {
  const t = useTranslations()
  const pathname = usePathname()
  const locale = useLocale()

  // Build a path with a different locale by replacing the first segment
  const buildHref = (locale: string) => {
    if (!pathname) return `/${locale}`
    const parts = pathname.split('/')
    parts[1] = locale
    return parts.join('/') || `/${locale}`
  }
  return (
    <footer className="border-t mt-12 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Image src="/logo.png" alt="TempMail logo" width={128} height={68} />
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            {t('footer.tagline') || 'Secure, anonymous temporary email addresses for your privacy and protection.'}
          </p>
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2 text-sm">
              <span>🌐</span>
              <span className="font-medium">{t('footer.language') || 'Language'}</span>
            </div>
            <select
              className="px-3 py-2 bg-background border rounded-md text-sm"
              value={locale}
              onChange={(e) => {
                window.location.href = buildHref(e.target.value)
              }}
            >
              {Array.from(locales).map((loc) => (
                <option key={loc} value={loc}>{languageNames[loc]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-3">{t('footer.company') || 'Company'}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link className="hover:underline" href="/about">{t('nav.about') || 'About'}</Link>
            <Link className="hover:underline" href="/privacy">{t('nav.privacy') || 'Privacy Policy'}</Link>
            <Link className="hover:underline" href="/terms">{t('nav.terms') || 'Terms of Service'}</Link>
            <Link className="hover:underline" href="/contact">{t('nav.contact') || 'Contact'}</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} TempMail. {t('footer.rights') || 'All rights reserved.'}
      </div>
    </footer>
  )
}


