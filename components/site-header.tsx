"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const t = useTranslations()
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" alt="TempMail logo" width={128} height={68} />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}


