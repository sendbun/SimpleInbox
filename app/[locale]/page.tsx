"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, Mail, RefreshCw, Settings, Trash2, Download, Printer } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  initializeEmailAccount, 
  loadEmailData, 
  saveEmailData,
  type EmailAccount,
  type Domain,
  type EmailMessage,
  fetchEmails
} from "@/lib/email-service"

export default function Home() {
  const t = useTranslations()
  const [tempEmail, setTempEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [currentAccount, setCurrentAccount] = useState<EmailAccount | null>(null)

  // Initialize email account on first visit
  useEffect(() => {
    const initializeAccount = async () => {
      try {
        setIsInitializing(true)
        
        // Check if we already have an account for this site
        const existingData = loadEmailData()
        
        if (existingData?.currentAccount) {
          // Use existing account
          setCurrentAccount(existingData.currentAccount)
          setTempEmail(existingData.currentAccount.email)
          setDomains(existingData.domains)
          
          // Load emails for existing account
          await loadEmails(existingData.currentAccount.id)
        } else {
          // Create new account
          const account = await initializeEmailAccount()
          setCurrentAccount(account)
          setTempEmail(account.email)
          
          // Load domains and emails
          const emailData = loadEmailData()
          if (emailData) {
            setDomains(emailData.domains)
            await loadEmails(account.id)
          }
          
          toast.success("Email account created", {
            description: `Your temporary email ${account.email} has been created successfully!`,
          })
        }
      } catch (error) {
        console.error("Error initializing account:", error)
        toast.error("Error", {
          description: "Failed to create email account. Please try again.",
        })
        
        // Set fallback email
        setTempEmail("user123456@tempmail.com")
      } finally {
        setIsInitializing(false)
        setIsLoading(false)
      }
    }

    initializeAccount()
  }, [])

  const loadEmails = async (accountId: string) => {
    try {
      const emailResponse = await fetchEmails(accountId)
      if (emailResponse && emailResponse.messages) {
        setEmails(emailResponse.messages)
      } else {
        setEmails([])
      }
    } catch (error) {
      console.error('Error loading emails:', error)
      setEmails([])
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(tempEmail)
    toast.success("Email copied", {
      description: "Temporary email address copied to clipboard",
    })
  }

  const generateNewEmail = async () => {
    try {
      setIsLoading(true)
      
      // Create new account
      const account = await initializeEmailAccount(true)
      setCurrentAccount(account)
      setTempEmail(account.email)
      
      // Clear emails for new account
      setEmails([])
      
      toast.success("New email generated", {
        description: "Your temporary email address has been updated",
      })
    } catch (error) {
      console.error('Error generating new email:', error)
      toast.error("Error", {
        description: "Failed to generate new email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshInbox = async () => {
    if (!currentAccount) return
    
    setIsLoading(true)
    try {
      await loadEmails(currentAccount.id)
      toast.success("Inbox refreshed", {
        description: "Your inbox has been updated",
      })
    } catch (error) {
      console.error('Error refreshing inbox:', error)
      toast.error("Error", {
        description: "Failed to refresh inbox. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEmail = (email: EmailMessage) => {
    setSelectedEmail(email)
    setIsModalOpen(true)
  }

  const deleteEmail = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id))
    setIsModalOpen(false)
    toast.success("Email deleted", {
      description: "The email has been removed from your inbox",
    })
  }

  const printEmail = () => {
    if (selectedEmail) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Email - ${selectedEmail.subject}</title>
            </head>
            <body>
              <h1>${selectedEmail.subject}</h1>
              <p><strong>From:</strong> ${selectedEmail.from}</p>
              <p><strong>Date:</strong> ${new Date(selectedEmail.date).toLocaleString()}</p>
              <div>${selectedEmail.html}</div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const downloadEmail = () => {
    if (selectedEmail) {
      const element = document.createElement("a")
      const file = new Blob(
        [
          `From: ${selectedEmail.from}\n`,
          `Subject: ${selectedEmail.subject}\n`,
          `Date: ${new Date(selectedEmail.date).toLocaleString()}\n\n`,
          selectedEmail.text,
        ],
        { type: "text/plain" },
      )
      element.href = URL.createObjectURL(file)
      element.download = `email-${selectedEmail.id}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">{t('status.creatingAccount') || 'Creating your temporary email account...'}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header moved to layout */}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            {/* Email Address Section */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="bg-muted p-3 rounded-md flex-1 font-mono text-sm break-all">{tempEmail}</div>
                    <div className="flex gap-2">
                      <Button onClick={copyEmail} className="flex-shrink-0">
                        <Copy className="h-4 w-4 mr-2" />
                        {t('actions.copy') || 'Copy'}
                      </Button>
                      <Button onClick={generateNewEmail} variant="outline" className="flex-shrink-0" disabled={isLoading}>
                        {t('actions.generateNew') || 'Generate New'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button onClick={refreshInbox} disabled={isLoading} variant="outline">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      {t('actions.refreshInbox') || 'Refresh Inbox'}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {emails.length} {t('labels.messages') || 'messages'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Banner */}
            <div className="bg-muted h-24 mb-6 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">{t('labels.adBanner') || 'Advertisement Banner'}</p>
            </div>

            {/* Email List */}
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/6" />
                          </div>
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : emails.length > 0 ? (
                emails.map((email) => (
                  <Card
                    key={email.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openEmail(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{email.from}</p>
                          <p className="text-lg font-semibold">{email.subject}</p>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t('status.inboxEmpty') || 'Your inbox is empty'}</h3>
                  <p className="text-muted-foreground mt-1">{t('status.newEmailsAppear') || 'New emails will appear here'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Ad Banner */}
          <div className="hidden lg:block bg-muted rounded-lg">
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground rotate-90 whitespace-nowrap">{t('labels.verticalAdBanner') || 'Vertical Advertisement Banner'}</p>
            </div>
          </div>
        </div>

        {/* SEO-friendly service description */}
        <div className="mb-8 mt-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{t('seo.heroTitle') || 'Free Temporary Email Service'}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('seo.heroP1') || 'Get instant disposable email addresses to protect your privacy and avoid spam.'} 
            {t('seo.heroP2') || 'Perfect for signing up to websites, testing applications, or keeping your inbox clean.'} 
            {t('seo.heroP3') || 'No registration required - start using temporary emails right away.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {t('seo.feature.instantEmail') || 'Instant email generation'}
            </span>
            <span className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              {t('seo.feature.noRegistration') || 'No registration needed'}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              {t('seo.feature.realTime') || 'Real-time inbox updates'}
            </span>
          </div>
        </div>

        {/* SEO-friendly content section */}
        <section className="mt-16 py-8 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{t('sections.whatIs.title') || 'What is TempMail?'}</h2>
                <p className="text-muted-foreground mb-4">
                  TempMail is a free temporary email service that provides disposable email addresses 
                  for users who want to protect their privacy online. Our service allows you to create 
                  temporary email addresses instantly without any registration or personal information required.
                </p>
                <p className="text-muted-foreground mb-4">
                  These temporary emails are perfect for signing up to websites, testing applications, 
                  avoiding spam, or any situation where you don't want to use your real email address.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">{t('sections.howTo.title') || 'How to Use TempMail'}</h2>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Visit our website and get an instant temporary email address</li>
                  <li>Copy the generated email address to your clipboard</li>
                  <li>Use it to sign up for websites or services</li>
                  <li>Check your inbox for incoming messages</li>
                  <li>Generate a new email address anytime for enhanced privacy</li>
                </ol>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('sections.benefits.privacy.title') || 'Privacy Protection'}</h3>
                <p className="text-sm text-muted-foreground">{t('sections.benefits.privacy.desc') || 'Keep your real email address private and avoid unwanted spam messages'}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('sections.benefits.noRegistration.title') || 'No Registration'}</h3>
                <p className="text-sm text-muted-foreground">{t('sections.benefits.noRegistration.desc') || 'Start using temporary emails immediately without creating an account'}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('sections.benefits.realTime.title') || 'Real-time Updates'}</h3>
                <p className="text-sm text-muted-foreground">{t('sections.benefits.realTime.desc') || 'Receive emails instantly and refresh your inbox anytime'}</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-bold mb-4">{t('sections.faq.title') || 'Frequently Asked Questions'}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t('sections.faq.q1') || 'Is TempMail completely free?'}</h3>
                <p className="text-sm text-muted-foreground">{t('sections.faq.a1') || 'Yes, our temporary email service is completely free to use. No hidden fees or premium features.'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('sections.faq.q2') || 'How long do temporary emails last?'}</h3>
                <p className="text-sm text-muted-foreground">{t('sections.faq.a2') || 'Temporary emails are active as long as you keep the page open. You can generate new addresses anytime.'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('sections.faq.q3') || 'Can I receive attachments?'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('sections.faq.a3') || 'Yes, you can receive emails with attachments. Download them directly from your inbox.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t('sections.faq.q4') || 'Is my data secure?'}</h3>
                  <p className="text-sm text-muted-foreground">
                    We prioritize your privacy. No personal information is collected, and emails are automatically deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Email Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4 text-sm">
            <div>
              <p>
                <strong>{t('modal.from') || 'From'}:</strong> {selectedEmail?.from}
              </p>
              <p>
                <strong>{t('modal.date') || 'Date'}:</strong> {selectedEmail?.date ? new Date(selectedEmail.date).toLocaleString() : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => selectedEmail && deleteEmail(selectedEmail.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('modal.delete') || 'Delete'}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadEmail}>
                <Download className="h-4 w-4 mr-2" />
                {t('modal.download') || 'Download'}
              </Button>
              <Button variant="outline" size="sm" onClick={printEmail}>
                <Printer className="h-4 w-4 mr-2" />
                {t('modal.print') || 'Print'}
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto border rounded-md p-4">
            {selectedEmail && <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
