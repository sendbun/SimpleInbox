"use client"

import { useTranslations } from "next-intl"

export default function PrivacyPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('pages.privacy.title') || 'Privacy Policy'}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t('pages.privacy.subtitle') || 'Your privacy matters to us'}</p>
      <p className="text-muted-foreground max-w-3xl">{t('pages.privacy.body') || "We don't require personal data to use TempMail. Emails are temporary and removed automatically according to our retention policy."}</p>
    </div>
  )
}


