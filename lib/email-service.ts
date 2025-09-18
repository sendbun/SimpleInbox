// Email service for managing temporary email accounts
import { generateHumanLikeEmail, generateProfessionalEmail, generateCasualEmail } from './name-generator'

export interface Domain {
  id: number
  name: string
  accounts: number
  total_emails: string
  memory: string
}

export interface EmailAccount {
  id: string
  email: string
  password: string
  created_at: string
  domain_id: string
  expires_at?: string // For 5-minute accounts
  is_5min?: boolean // Flag to identify 5-minute accounts
}

export interface SiteEmailData {
  domains: Domain[]
  currentAccount: EmailAccount | null
  lastUpdated: string
}

export interface FiveMinEmailData {
  domains: Domain[]
  currentAccount: EmailAccount | null
  lastUpdated: string
}

// Generate a unique site key based on the current domain
export function getSiteKey(): string {
  if (typeof window === 'undefined') return 'tempmail-default'
  
  const hostname = window.location.hostname
  
  // Create a unique key based on hostname only (not pathname)
  // This ensures the same key is used across all pages of the site
  const siteKey = `tempmail-${hostname}`.replace(/[^a-zA-Z0-9-]/g, '-')
  return siteKey
}

// Generate a unique site key for 5-minute emails
export function getFiveMinSiteKey(): string {
  if (typeof window === 'undefined') return 'tempmail-5min-default'
  
  const hostname = window.location.hostname
  
  // Create a unique key for 5-minute emails
  const siteKey = `tempmail-5min-${hostname}`.replace(/[^a-zA-Z0-9-]/g, '-')
  return siteKey
}

// Generate a strong password
export function generateStrongPassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Load domains from API
export async function loadDomains(): Promise<Domain[]> {
  try {
    const response = await fetch('/api/domains/site-domains', { cache: 'no-store' })
    const result = await response.json()
    
    if (result.success) {
      return result.data.domains || result.data // Handle both formats
    } else {
      console.warn('Failed to load domains from API, using fallback domains:', result.error)
      // Return fallback domains when API fails
      return [
        { id: 1, name: 'sendbun.com', accounts: 0, total_emails: '0', memory: '0' },
        { id: 2, name: 'mailbun.cc', accounts: 0, total_emails: '0', memory: '0' }
      ]
    }
  } catch (error) {
    console.error('Error loading domains:', error)
    console.warn('Using fallback domains due to API error')
    // Return fallback domains when API is completely unavailable
    return [
      { id: 1, name: 'sendbun.com', accounts: 0, total_emails: '0', memory: '0' },
      { id: 2, name: 'mailbun.cc', accounts: 0, total_emails: '0', memory: '0' },
      { id: 3, name: 'tempmail.org', accounts: 0, total_emails: '0', memory: '0' }
    ]
  }
}

// Create email account
export async function createEmailAccount(email: string, password: string, is5Min: boolean = false): Promise<EmailAccount> {
  try {
    const response = await fetch('/api/accounts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Handle the actual API response structure
      const apiData = result.data
      const now = new Date()
      const expiresAt = is5Min ? new Date(now.getTime() + 5 * 60 * 1000).toISOString() : undefined
      
      return {
        id: apiData.id?.toString() || Date.now().toString(),
        email: apiData.email || email,
        password,
        created_at: now.toISOString(),
        domain_id: apiData.domain_id || '',
        expires_at: expiresAt,
        is_5min: is5Min
      }
    } else {
      // If API fails, create a mock account for demo purposes
      console.warn('API failed, creating mock account:', result.error)
      const now = new Date()
      const expiresAt = is5Min ? new Date(now.getTime() + 5 * 60 * 1000).toISOString() : undefined
      
      return {
        id: Date.now().toString(),
        email: email,
        password,
        created_at: now.toISOString(),
        domain_id: 'mock',
        expires_at: expiresAt,
        is_5min: is5Min
      }
    }
  } catch (error) {
    console.error('Error creating email account:', error)
    // Create a mock account when API is completely unavailable
    console.warn('Creating mock account due to API error')
    const now = new Date()
    const expiresAt = is5Min ? new Date(now.getTime() + 5 * 60 * 1000).toISOString() : undefined
    
    return {
      id: Date.now().toString(),
      email: email,
      password,
      created_at: now.toISOString(),
      domain_id: 'mock',
      expires_at: expiresAt,
      is_5min: is5Min
    }
  }
}

// Delete email account
export async function deleteEmailAccount(accountId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/accounts/${accountId}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      return true
    } else {
      console.warn('Failed to delete account via API:', result.error)
      return true // Return true for mock accounts
    }
  } catch (error) {
    console.error('Error deleting email account:', error)
    return true // Return true for mock accounts
  }
}

// Delete individual email
export async function deleteEmail(emailAccountId: string, messageId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/emails/${emailAccountId}/${messageId}/delete`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      return true
    } else {
      console.warn('Failed to delete email via API:', result.error)
      return false
    }
  } catch (error) {
    console.error('Error deleting email:', error)
    return false
  }
}

// LocalStorage management for regular emails
export function saveEmailData(data: SiteEmailData): void {
  if (typeof window === 'undefined') return
  
  const siteKey = getSiteKey()
  localStorage.setItem(siteKey, JSON.stringify(data))
}

export function loadEmailData(): SiteEmailData | null {
  if (typeof window === 'undefined') return null
  
  const siteKey = getSiteKey()
  const data = localStorage.getItem(siteKey)
  
  if (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Error parsing localStorage data:', error)
      return null
    }
  }
  
  return null
}

export function clearEmailData(): void {
  if (typeof window === 'undefined') return
  
  const siteKey = getSiteKey()
  localStorage.removeItem(siteKey)
}

// LocalStorage management for 5-minute emails (separate storage)
export function saveFiveMinEmailData(data: FiveMinEmailData): void {
  if (typeof window === 'undefined') return
  
  const siteKey = getFiveMinSiteKey()
  localStorage.setItem(siteKey, JSON.stringify(data))
}

export function loadFiveMinEmailData(): FiveMinEmailData | null {
  if (typeof window === 'undefined') return null
  
  const siteKey = getFiveMinSiteKey()
  const data = localStorage.getItem(siteKey)
  
  if (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Error parsing 5-min localStorage data:', error)
      return null
    }
  }
  
  return null
}

export function clearFiveMinEmailData(): void {
  if (typeof window === 'undefined') return
  
  const siteKey = getFiveMinSiteKey()
  localStorage.removeItem(siteKey)
}

// Check if account is expired
export function isAccountExpired(account: EmailAccount): boolean {
  if (!account.expires_at) return false
  return new Date() > new Date(account.expires_at)
}

// Get time remaining for 5-minute account
export function getTimeRemaining(account: EmailAccount): number {
  if (!account.expires_at) return 0
  const now = new Date().getTime()
  const expiresAt = new Date(account.expires_at).getTime()
  return Math.max(0, Math.floor((expiresAt - now) / 1000))
}

// Main function to initialize regular email account
export async function initializeEmailAccount(forceNew: boolean = false): Promise<EmailAccount> {
  // Check if we already have an account for this site
  const existingData = loadEmailData()
  
  if (!forceNew && existingData?.currentAccount) {
    // Check if the account is still valid (less than 24 hours old)
    const accountAge = Date.now() - new Date(existingData.currentAccount.created_at).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (accountAge < maxAge) {
      return existingData.currentAccount
    }
  }
  
  // Load domains
  const domains = await loadDomains()
  
  if (domains.length === 0) {
    throw new Error('No domains available')
  }
  
  // Select a random domain
  const randomDomain = domains[Math.floor(Math.random() * domains.length)]
  
  // Generate email and password using the name generator
  const username = generateHumanLikeEmail()
  const email = `${username}@${randomDomain.name}`
  const password = generateStrongPassword()
  
  // Create the account
  const account = await createEmailAccount(email, password, false)
  
  // Save to localStorage (overwrite if forcing new)
  const emailData: SiteEmailData = {
    domains,
    currentAccount: account,
    lastUpdated: new Date().toISOString()
  }
  
  saveEmailData(emailData)
  
  return account
}

// Initialize 5-minute email account (separate storage)
export async function initialize5MinEmailAccount(): Promise<EmailAccount> {
  // Check if we already have a valid 5-minute account
  const existingData = loadFiveMinEmailData()
  
  if (existingData?.currentAccount && !isAccountExpired(existingData.currentAccount)) {
    return existingData.currentAccount
  }
  
  // Load domains
  const domains = await loadDomains()
  
  if (domains.length === 0) {
    throw new Error('No domains available')
  }
  
  // Select a random domain
  const randomDomain = domains[Math.floor(Math.random() * domains.length)]
  
  // Generate email and password
  const username = generateHumanLikeEmail()
  const email = `${username}@${randomDomain.name}`
  const password = generateStrongPassword()
  
  // Create the 5-minute account
  const account = await createEmailAccount(email, password, true)
  
  // Save to separate localStorage
  const emailData: FiveMinEmailData = {
    domains,
    currentAccount: account,
    lastUpdated: new Date().toISOString()
  }
  
  saveFiveMinEmailData(emailData)
  
  return account
}

// Clean up expired accounts (both regular and 5-minute)
export async function cleanupExpiredAccounts(): Promise<void> {
  // Clean up regular accounts
  const regularData = loadEmailData()
  if (regularData?.currentAccount && isAccountExpired(regularData.currentAccount)) {
    await deleteEmailAccount(regularData.currentAccount.id)
    regularData.currentAccount = null
    saveEmailData(regularData)
  }
  
  // Clean up 5-minute accounts
  const fiveMinData = loadFiveMinEmailData()
  if (fiveMinData?.currentAccount && isAccountExpired(fiveMinData.currentAccount)) {
    await deleteEmailAccount(fiveMinData.currentAccount.id)
    fiveMinData.currentAccount = null
    saveFiveMinEmailData(fiveMinData)
  }
}

// Clean up only 5-minute expired accounts
export async function cleanupExpired5MinAccounts(): Promise<void> {
  const fiveMinData = loadFiveMinEmailData()
  if (fiveMinData?.currentAccount && isAccountExpired(fiveMinData.currentAccount)) {
    await deleteEmailAccount(fiveMinData.currentAccount.id)
    fiveMinData.currentAccount = null
    saveFiveMinEmailData(fiveMinData)
  }
}

// Additional email generation functions for different styles
export function generateProfessionalEmailAccount(domain: string): { email: string; password: string } {
  const username = generateProfessionalEmail()
  const email = `${username}@${domain}`
  const password = generateStrongPassword()
  
  return { email, password }
}

export function generateHumanLikeEmailAccount(domain: string): { email: string; password: string } {
  const username = generateHumanLikeEmail()
  const email = `${username}@${domain}`
  const password = generateStrongPassword()
  
  return { email, password }
}

// Email interface for API response
export interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  text: string
  html: string
  date: string
  read: boolean
  folder: string
  body?: string
  mail_headers?: {
    from: Array<{
      full: string
      personal: string
    }>
    to: Array<{
      full: string
      personal: string
    }>
  }
  is_seen?: string
}

// Pagination interface
export interface EmailPagination {
  current_page: number
  total_pages: number
  total_items: number
  items_per_page: number
  currentPage?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
  hasNextPage?: boolean
}

// Email list response interface
export interface EmailListResponse {
  messages: EmailMessage[]
  pagination: EmailPagination
}

// Fetch emails with pagination
export async function fetchEmails(
  emailAccountId: string, 
  currentPage: number = 1, 
  filterFolder: string = 'inbox,spam'
): Promise<EmailListResponse | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(
      `/api/emails?emailAccountId=${emailAccountId}&folder=${filterFolder}&page=${currentPage}`,
      { cache: 'no-store', signal: controller.signal }
    )
    clearTimeout(timeoutId)
    const result = await response.json()
    
    if (result.success && result.data && result.data.data) {
      // Handle the actual API response structure
      const apiEmails = result.data.data
      const apiPagination = result.data.pagination
      
      // Convert API emails to our format
      const messages: EmailMessage[] = apiEmails.map((email: any) => ({
        id: email.id.toString(),
        from: email.from || (email.mail_headers?.from?.[0]?.full || 'Unknown'),
        to: email.to || (email.mail_headers?.to?.[0]?.full || 'Unknown'),
        subject: email.subject || 'No Subject',
        text: email.body || email.html || 'No content',
        html: email.html || email.body || 'No content',
        date: email.date,
        read: email.is_seen === '1',
        folder: email.folder,
        body: email.body,
        mail_headers: email.mail_headers,
        is_seen: email.is_seen
      }))
      
      // Convert API pagination to our format
      const pagination: EmailPagination = {
        current_page: apiPagination.currentPage || apiPagination.current_page || 1,
        total_pages: apiPagination.totalPages || apiPagination.total_pages || 1,
        total_items: apiPagination.totalItems || apiPagination.total_items || 0,
        items_per_page: apiPagination.pageSize || apiPagination.items_per_page || 10,
        currentPage: apiPagination.currentPage,
        pageSize: apiPagination.pageSize,
        totalItems: apiPagination.totalItems,
        totalPages: apiPagination.totalPages,
        hasNextPage: apiPagination.hasNextPage
      }
      
      return {
        messages,
        pagination
      }
    } else {
      console.warn('Failed to fetch emails via API:', result.error)
      return null
    }
  } catch (error) {
    console.error('Error fetching emails:', error)
    return null
  }
} 