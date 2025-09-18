"use client"

import { useTranslations } from "next-intl"

export default function TermsPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('pages.terms.title') || 'Terms of Service'}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t('pages.terms.subtitle') || 'Please read these terms carefully'}</p>
      <p className="text-muted-foreground max-w-3xl">{t('pages.terms.body') || 'By using TempMail, you agree to use disposable addresses responsibly and comply with applicable laws and website terms.'}</p>
    </div>
  )
}


