"use client"

import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('pages.about.title') || 'About'}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t('pages.about.subtitle') || 'Learn more about TempMail'}</p>
      <p className="text-muted-foreground max-w-3xl">{t('pages.about.body') || 'TempMail provides privacy-first disposable email addresses so you can sign up anywhere without exposing your real inbox.'}</p>
    </div>
  )
}


