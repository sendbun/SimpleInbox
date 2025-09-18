"use client"

import { useTranslations } from "next-intl"

export default function ContactPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('pages.contact.title') || 'Contact'}</h1>
      <p className="text-sm text-muted-foreground mb-4">{t('pages.contact.subtitle') || 'Get in touch with us'}</p>
      <p className="text-muted-foreground max-w-3xl">{t('pages.contact.body') || "Questions or feedback? Reach out and we'll get back to you soon."}</p>
    </div>
  )
}


