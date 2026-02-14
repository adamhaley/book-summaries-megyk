'use client'

import { useState } from 'react'
import { Modal, Stack, Text, Button, Group, ThemeIcon, Box, Paper, TextInput, Tooltip } from '@mantine/core'
import { IconCoins, IconAlertCircle, IconGift, IconSend, IconCheck, IconCopy, IconLoader2 } from '@tabler/icons-react'
import { formatCredits } from '@/lib/types/credits'
import { REFERRAL_REWARDS } from '@/lib/types/referral'

interface InsufficientCreditsModalProps {
  opened: boolean
  onClose: () => void
  requiredCredits: number
  currentBalance: number
  actionName?: string
}

export function InsufficientCreditsModal({
  opened,
  onClose,
  requiredCredits,
  currentBalance,
  actionName = 'this action',
}: InsufficientCreditsModalProps) {
  const shortfall = requiredCredits - currentBalance

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState<string | null>(null)

  // Fetch referral link on first render if not already fetched
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
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/v1/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invite')
        return
      }

      setSuccess(`Invite sent to ${email}!`)
      setEmail('')
      setName('')

      // Clear success after 3 seconds to allow another invite
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to send invite. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = async () => {
    const link = await fetchReferralLink()
    if (link) {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !sending && email.trim()) {
      handleSendInvite()
    }
  }

  // Reset state when modal closes
  const handleClose = () => {
    setEmail('')
    setName('')
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <ThemeIcon color="red" variant="light" size="lg">
            <IconAlertCircle size={20} />
          </ThemeIcon>
          <Text size="lg" fw={600}>
            Insufficient Credits
          </Text>
        </Group>
      }
      centered
      size="md"
      zIndex={1500}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          You don't have enough Megyk Credits to perform {actionName}.
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
              <Text size="sm" fw={600} c="red">{formatCredits(requiredCredits)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Your balance:</Text>
              <Text size="sm" fw={600}>{formatCredits(currentBalance)}</Text>
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

          {success ? (
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
                  {success}
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
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  error={error}
                  size="sm"
                  style={{ flex: 2 }}
                />
                <TextInput
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </Group>

              <Button
                variant="gradient"
                gradient={{ from: 'violet', to: 'indigo' }}
                leftSection={sending ? <IconLoader2 size={18} className="animate-spin" /> : <IconSend size={18} />}
                onClick={handleSendInvite}
                disabled={sending || !email.trim()}
                fullWidth
              >
                {sending ? 'Sending...' : 'Send Invite'}
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

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
