'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Modal, Stack, Text, Button, Slider, Box, Loader, Center, Alert, Group, Badge, Paper, TextInput, ThemeIcon, Tooltip, ActionIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconSparkles, IconCheck, IconCoins, IconGift, IconSend, IconCopy, IconLoader2, IconArrowLeft } from '@tabler/icons-react'
import { REFERRAL_REWARDS } from '@/lib/types/referral'
import {
  UserPreferences,
  SUMMARY_STYLE_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  DEFAULT_PREFERENCES,
  SummaryStyle,
  SummaryLength
} from '@/lib/types/preferences'
import { Book } from '@/lib/types/books'
import { getDisplayTitle } from '@/lib/utils/bookTitle'
import { getSummaryCreditCost, formatCredits, CreditBalance } from '@/lib/types/credits'
import { refreshCreditBalance } from '@/components/credits'

type ModalScreen = 'summary' | 'invite'

interface GenerateSummaryModalProps {
  opened: boolean
  onClose: () => void
  book: Book | null
}

export function GenerateSummaryModal({ opened, onClose, book }: GenerateSummaryModalProps) {
  const [screen, setScreen] = useState<ModalScreen>('summary')
  const [styleIndex, setStyleIndex] = useState(
    SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.style)
  )
  const [lengthIndex, setLengthIndex] = useState(
    SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.length)
  )
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState<string | null>(null)

  const style = SUMMARY_STYLE_OPTIONS[styleIndex].value as SummaryStyle
  const length = SUMMARY_LENGTH_OPTIONS[lengthIndex].value as SummaryLength

  // Calculate credit cost based on current selection
  const creditCost = useMemo(() => {
    return getSummaryCreditCost(style, length)
  }, [style, length])

  const canAfford = creditBalance ? creditBalance.current_balance >= creditCost : false

  const fetchCreditBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/credits')
      if (response.ok) {
        const data = await response.json()
        setCreditBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error)
    }
  }, [])

  useEffect(() => {
    if (opened) {
      fetchPreferences()
      fetchCreditBalance()
      // Reset to summary screen and clear invite form
      setScreen('summary')
      setInviteEmail('')
      setInviteName('')
      setInviteSuccess(null)
      setInviteError(null)
    }
  }, [opened, fetchCreditBalance])

  // Pre-fetch referral link when entering invite screen
  useEffect(() => {
    if (screen === 'invite' && !referralLink) {
      fetchReferralLink()
    }
  }, [screen, referralLink])

  const fetchPreferences = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // Check if we have cached preferences in sessionStorage
      const cached = sessionStorage.getItem('user_preferences')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === cachedData.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === cachedData.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
          setLoading(false)
          return
        } catch (e) {
          sessionStorage.removeItem('user_preferences')
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/v1/profile', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          sessionStorage.setItem('user_preferences', JSON.stringify(data.preferences))

          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === data.preferences.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === data.preferences.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Profile request timeout - using default preferences')
      } else {
        console.error('Error fetching preferences:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralLink = async () => {
    if (referralLink) return referralLink
    try {
      const response = await fetch('/api/v1/referrals')
      if (response.ok) {
        const data = await response.json()
        setReferralLink(data.stats?.referral_link || null)
        return data.stats?.referral_link
      }
    } catch (err) {
      console.error('Failed to fetch referral link:', err)
    }
    return null
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address')
      return
    }

    setInviteSending(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const response = await fetch('/api/v1/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), name: inviteName.trim() || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        setInviteError(data.error || 'Failed to send invite')
        return
      }

      setInviteSuccess(`Invite sent to ${inviteEmail}!`)
      setInviteEmail('')
      setInviteName('')

      setTimeout(() => setInviteSuccess(null), 3000)
    } catch (err) {
      setInviteError('Failed to send invite. Please try again.')
    } finally {
      setInviteSending(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      // Use cached link if available, otherwise fetch
      const link = referralLink || await fetchReferralLink()
      if (link) {
        await navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // Fallback: create a temporary input element
      const link = referralLink
      if (link) {
        const textArea = document.createElement('textarea')
        textArea.value = link
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleInviteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !inviteSending && inviteEmail.trim()) {
      handleSendInvite()
    }
  }

  const handleGenerate = async () => {
    if (!book) return

    setGenerating(true)
    setErrorMessage(null)

    try {
      console.log('Starting summary generation for book:', book.id)

      const response = await fetch('/api/v1/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: book.id,
          preferences: { style, length }
        }),
      })

      console.log('Response received:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        ok: response.ok
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''

        // Check if response is a PDF
        if (contentType.includes('application/pdf')) {
          console.log('PDF detected, initiating download...')
          const blob = await response.blob()
          console.log('Blob size:', blob.size, 'bytes')

          // Sanitize filename helper
          const sanitizeFilename = (str: string) => {
            return str
              .replace(/[^a-z0-9]/gi, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '')
              .toLowerCase()
          }

          const sanitizedTitle = sanitizeFilename(book.title)
          const filename = `${sanitizedTitle}_${length}_${style}.pdf`

          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()

          // Small delay before cleanup to ensure download starts
          setTimeout(() => {
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }, 100)

          notifications.show({
            title: 'Summary Generated!',
            message: `Your personalized summary for "${getDisplayTitle(book.title) || book.title}" has been downloaded.`,
            color: 'green',
            icon: <IconCheck size={18} />,
            autoClose: 5000,
          })

          // Refresh credit balance in header
          refreshCreditBalance()

          onClose() // Close modal on success
        } else {
          // Non-PDF response - something went wrong
          console.error('Expected PDF but received:', contentType)
          const data = await response.json().catch(() => ({}))
          console.log('Response data:', data)

          setErrorMessage('Expected PDF response but received a different format. Please try again.')
        }
      } else if (response.status === 402) {
        // Insufficient credits - switch to invite screen
        setScreen('invite')
      } else {
        console.error('Response not OK:', response.status, response.statusText)
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        setErrorMessage(error.error || `Failed to generate summary (${response.status})`)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const shortfall = creditBalance ? creditCost - creditBalance.current_balance : 0

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          {screen === 'invite' && (
            <ActionIcon
              variant="subtle"
              onClick={() => setScreen('summary')}
              aria-label="Back to summary"
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
          )}
          <Text size="xl" fw={700}>
            {screen === 'summary' ? 'Generate Summary' : 'Earn More Credits'}
          </Text>
        </Group>
      }
      size="lg"
      centered
      zIndex={1400}
      styles={{
        body: {
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: 'calc(100dvh - 160px)',
          WebkitOverflowScrolling: 'touch',
        },
        content: {
          maxHeight: '90dvh',
        },
        inner: {
          padding: '20px',
        },
      }}
    >
      {/* Summary Screen */}
      {screen === 'summary' && (
        <Stack gap="md">
          {book && (
            <Box
              p="md"
              style={{
                backgroundColor: 'var(--mantine-color-default-hover)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Text fw={600} size="lg" mb="xs">
                {getDisplayTitle(book.title) || book.title}
              </Text>
              {(book.summary || book.description) && (
                <Text size="sm" c="dimmed" mt="xs">
                  {book.summary || book.description}
                </Text>
              )}
            </Box>
          )}

          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {errorMessage}
            </Alert>
          )}

          {loading ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" type="dots" />
                <Text c="dimmed">Loading preferences...</Text>
              </Stack>
            </Center>
          ) : generating ? (
            <Center py="xl">
              <Stack align="center" gap="lg">
                <Loader size="xl" type="dots" />
                <Stack align="center" gap="xs">
                  <Text size="lg" fw={600}>
                    Generating Your Personalized Summary
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" maw={400}>
                    AI is analyzing "{book?.title}" and creating a custom summary based on your preferences. This could take up to a few minutes...
                  </Text>
                </Stack>
              </Stack>
            </Center>
          ) : (
            <>
              <Stack gap="md">
                <div>
                  <Text size="md" fw={600} mb="xs">
                    Summary Style
                  </Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Choose how you want your book summary presented
                  </Text>
                </div>
                <Box px="md" pb="md" mx="sm">
                  <Slider
                    value={styleIndex}
                    onChange={setStyleIndex}
                    min={0}
                    max={SUMMARY_STYLE_OPTIONS.length - 1}
                    step={1}
                    marks={SUMMARY_STYLE_OPTIONS.map((option, index) => ({
                      value: index,
                      label: option.label
                    }))}
                    size="lg"
                    styles={{
                      markLabel: {
                        marginTop: 8,
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        transform: 'translateX(-50%)'
                      },
                      bar: { backgroundColor: '#2563EB', opacity: 0.8 },
                      thumb: {
                        borderColor: '#2563EB',
                        backgroundColor: '#2563EB',
                        opacity: 0.8
                      }
                    }}
                  />
                </Box>
                <Box
                  p="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-default-hover)',
                    borderRadius: 'var(--mantine-radius-md)',
                    textAlign: 'center'
                  }}
                >
                  <Text fw={600} size="md" mb="xs">
                    {SUMMARY_STYLE_OPTIONS[styleIndex].label}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {SUMMARY_STYLE_OPTIONS[styleIndex].description}
                  </Text>
                </Box>
              </Stack>

              <Stack gap="md">
                <div>
                  <Text size="md" fw={600} mb="xs">
                    Summary Length
                  </Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Select your preferred max summary length
                  </Text>
                </div>
                <Box px="md" pb="md" mx="sm">
                  <Slider
                    value={lengthIndex}
                    onChange={setLengthIndex}
                    min={0}
                    max={SUMMARY_LENGTH_OPTIONS.length - 1}
                    step={1}
                    marks={SUMMARY_LENGTH_OPTIONS.map((option, index) => ({
                      value: index,
                      label: option.label
                    }))}
                    size="lg"
                    styles={{
                      markLabel: {
                        marginTop: 8,
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        transform: 'translateX(-50%)'
                      },
                      bar: { backgroundColor: '#2563EB', opacity: 0.8 },
                      thumb: {
                        borderColor: '#2563EB',
                        backgroundColor: '#2563EB',
                        opacity: 0.8
                      }
                    }}
                  />
                </Box>
                <Box
                  p="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-default-hover)',
                    borderRadius: 'var(--mantine-radius-md)',
                    textAlign: 'center'
                  }}
                >
                  <Text fw={600} size="md" mb="xs">
                    {SUMMARY_LENGTH_OPTIONS[lengthIndex].label}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {SUMMARY_LENGTH_OPTIONS[lengthIndex].description}
                  </Text>
                </Box>
              </Stack>

              {/* Credit Cost Display */}
              <Box
                p="md"
                style={{
                  backgroundColor: canAfford ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-red-0)',
                  borderRadius: 'var(--mantine-radius-md)',
                  border: `1px solid ${canAfford ? 'var(--mantine-color-blue-2)' : 'var(--mantine-color-red-2)'}`,
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <IconCoins size={18} style={{ color: canAfford ? '#2563EB' : '#dc2626' }} />
                    <Text size="sm" fw={600}>
                      Cost: {formatCredits(creditCost)}
                    </Text>
                  </Group>
                  {creditBalance && (
                    <Badge
                      variant="light"
                      color={canAfford ? 'blue' : 'red'}
                      size="lg"
                    >
                      Balance: {formatCredits(creditBalance.current_balance)}
                    </Badge>
                  )}
                </Group>
                {!canAfford && creditBalance && (
                  <Stack gap="xs" mt="xs">
                    <Text size="xs" c="red">
                      You need {formatCredits(shortfall)} more credits
                    </Text>
                    <Group gap="xs" align="center">
                      <IconGift size={14} style={{ color: 'var(--mantine-color-violet-6)' }} />
                      <Text size="xs" c="dimmed">
                        <Text
                          span
                          c="violet"
                          fw={600}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setScreen('invite')}
                        >
                          Invite friends
                        </Text>
                        {' '}to earn more MC's! ({REFERRAL_REWARDS.referrer_bonus.toLocaleString()} per friend)
                      </Text>
                    </Group>
                  </Stack>
                )}
              </Box>

              <Button
                fullWidth
                size="md"
                leftSection={<IconSparkles size={18} />}
                onClick={handleGenerate}
                loading={generating}
                disabled={!book || !canAfford}
                style={{
                  backgroundColor: canAfford ? '#2563EB' : undefined,
                  color: canAfford ? '#ffffff' : undefined,
                }}
              >
                {canAfford ? 'Generate Summary' : 'Insufficient Credits'}
              </Button>
            </>
          )}
        </Stack>
      )}

      {/* Invite Screen */}
      {screen === 'invite' && (
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            You need {formatCredits(shortfall)} more credits to generate this summary.
          </Text>

          <Box
            p="md"
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Required:</Text>
                <Text size="sm" fw={600} c="red">{formatCredits(creditCost)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Your balance:</Text>
                <Text size="sm" fw={600}>{formatCredits(creditBalance?.current_balance || 0)}</Text>
              </Group>
              <Box
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-3)',
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Shortfall:</Text>
                  <Text size="sm" fw={700} c="red">{formatCredits(shortfall)}</Text>
                </Group>
              </Box>
            </Stack>
          </Box>

          {/* Inline Invite Form */}
          <Paper
            p="md"
            radius="md"
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-violet-0) 0%, var(--mantine-color-indigo-0) 100%)',
              border: '1px solid var(--mantine-color-violet-2)',
            }}
          >
            <Group gap="sm" mb="md" wrap="nowrap">
              <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                <IconGift size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>
                  Invite a friend, get {REFERRAL_REWARDS.referrer_bonus.toLocaleString()} MC!
                </Text>
                <Text size="xs" c="dimmed">
                  They get {REFERRAL_REWARDS.referred_bonus.toLocaleString()} MC too
                </Text>
              </div>
            </Group>

            {inviteSuccess ? (
              <Box
                p="md"
                style={{
                  backgroundColor: 'var(--mantine-color-green-0)',
                  borderRadius: 'var(--mantine-radius-md)',
                  border: '1px solid var(--mantine-color-green-3)',
                }}
              >
                <Group gap="xs">
                  <IconCheck size={18} color="var(--mantine-color-green-6)" />
                  <Text size="sm" fw={500} c="green">
                    {inviteSuccess}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  Want to invite another friend?
                </Text>
              </Box>
            ) : (
              <Stack gap="sm">
                <Group gap="sm" grow>
                  <TextInput
                    placeholder="Friend's email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.currentTarget.value)}
                    onKeyDown={handleInviteKeyDown}
                    disabled={inviteSending}
                    error={inviteError}
                    size="sm"
                    style={{ flex: 2 }}
                  />
                  <TextInput
                    placeholder="Name (optional)"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.currentTarget.value)}
                    onKeyDown={handleInviteKeyDown}
                    disabled={inviteSending}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </Group>

                <Button
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'indigo' }}
                  leftSection={inviteSending ? <IconLoader2 size={18} className="animate-spin" /> : <IconSend size={18} />}
                  onClick={handleSendInvite}
                  disabled={inviteSending || !inviteEmail.trim()}
                  fullWidth
                >
                  {inviteSending ? 'Sending...' : 'Send Invite'}
                </Button>
              </Stack>
            )}

            {/* Copy link fallback */}
            <Group justify="center" mt="md" gap="xs">
              <Text size="xs" c="dimmed">or</Text>
              <Tooltip label={copied ? 'Copied!' : 'Copy your referral link'}>
                <Button
                  variant="subtle"
                  size="xs"
                  color={copied ? 'green' : 'gray'}
                  leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </Tooltip>
            </Group>
          </Paper>

          <Text size="xs" c="dimmed" ta="center">
            Subscription plans coming soon!
          </Text>

          <Button variant="default" onClick={() => setScreen('summary')}>
            Back to Summary
          </Button>
        </Stack>
      )}
    </Modal>
  )
}
