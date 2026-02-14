'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  SimpleGrid,
  ThemeIcon,
  Skeleton,
  Alert,
  Tooltip,
  Box,
  Paper,
} from '@mantine/core'
import {
  IconShare,
  IconCopy,
  IconCheck,
  IconUsers,
  IconClock,
  IconCoins,
  IconGift,
  IconAlertCircle,
} from '@tabler/icons-react'
import { ReferralStats, REFERRAL_REWARDS } from '@/lib/types/referral'

export function ReferralShareSection() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareSupported, setShareSupported] = useState(false)

  useEffect(() => {
    // Check if native share is supported
    setShareSupported(typeof navigator !== 'undefined' && !!navigator.share)
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/v1/referrals')

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching referral stats:', err)
      setError('Failed to load referral information')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = useCallback(async () => {
    if (!stats?.referral_link) return

    try {
      await navigator.clipboard.writeText(stats.referral_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [stats?.referral_link])

  const handleShare = useCallback(async () => {
    if (!stats?.referral_link || !navigator.share) return

    try {
      await navigator.share({
        title: 'Join Megyk Books',
        text: `Sign up for Megyk Books and get ${REFERRAL_REWARDS.referred_bonus.toLocaleString()} bonus MC! Use my referral link:`,
        url: stats.referral_link,
      })
    } catch (err) {
      // User cancelled or share failed - not an error
      if ((err as Error).name !== 'AbortError') {
        console.error('Failed to share:', err)
      }
    }
  }, [stats?.referral_link])

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Skeleton height={24} width="40%" />
          <Skeleton height={16} width="60%" />
          <Skeleton height={40} />
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </SimpleGrid>
        </Stack>
      </Card>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Card>
    )
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb={4}>
              <ThemeIcon size="md" radius="md" variant="light" color="violet">
                <IconGift size={18} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Refer Friends
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Share your link and earn {REFERRAL_REWARDS.referrer_bonus.toLocaleString()} MC for each friend who joins
            </Text>
          </div>
        </Group>

        {/* Referral Link */}
        <Group gap="xs" align="flex-end">
          <TextInput
            label="Your referral link"
            value={stats?.referral_link || ''}
            readOnly
            style={{ flex: 1 }}
            styles={{
              input: { fontFamily: 'monospace', fontSize: 13 },
            }}
          />
          <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
            <Button
              variant={copied ? 'filled' : 'light'}
              color={copied ? 'green' : 'blue'}
              onClick={handleCopy}
            >
              {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
            </Button>
          </Tooltip>
          {shareSupported && (
            <Button variant="light" onClick={handleShare}>
              <IconShare size={18} />
            </Button>
          )}
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <StatCard
            icon={<IconUsers size={20} />}
            label="Total Invited"
            value={(stats?.pending || 0) + (stats?.successful || 0)}
            color="blue"
          />
          <StatCard
            icon={<IconClock size={20} />}
            label="Pending"
            value={stats?.pending || 0}
            color="yellow"
          />
          <StatCard
            icon={<IconCheck size={20} />}
            label="Activated"
            value={stats?.successful || 0}
            color="green"
          />
          <StatCard
            icon={<IconCoins size={20} />}
            label="Credits Earned"
            value={`${(stats?.total_earned || 0).toLocaleString()} MC`}
            color="violet"
          />
        </SimpleGrid>

        {/* How it works */}
        <Paper p="md" radius="md" bg="gray.0" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
          <Text size="sm" fw={600} mb="xs">
            How it works
          </Text>
          <Stack gap={6}>
            <Group gap="xs" wrap="nowrap">
              <Box w={20} ta="center">
                <Text size="sm" c="dimmed">1.</Text>
              </Box>
              <Text size="sm" c="dimmed">Share your unique referral link with friends</Text>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Box w={20} ta="center">
                <Text size="sm" c="dimmed">2.</Text>
              </Box>
              <Text size="sm" c="dimmed">They sign up and verify their email</Text>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Box w={20} ta="center">
                <Text size="sm" c="dimmed">3.</Text>
              </Box>
              <Text size="sm" c="dimmed">When they send their first chat or generate a summary, you both earn bonus credits!</Text>
            </Group>
          </Stack>
          <Group gap="md" mt="md">
            <Group gap={4}>
              <IconGift size={14} color="var(--mantine-color-violet-6)" />
              <Text size="sm" fw={500}>You get: {REFERRAL_REWARDS.referrer_bonus.toLocaleString()} MC</Text>
            </Group>
            <Group gap={4}>
              <IconGift size={14} color="var(--mantine-color-green-6)" />
              <Text size="sm" fw={500}>They get: {REFERRAL_REWARDS.referred_bonus.toLocaleString()} MC</Text>
            </Group>
          </Group>
        </Paper>
      </Stack>
    </Card>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Paper p="sm" radius="md" withBorder>
      <Group gap="xs" mb={4}>
        <ThemeIcon size="sm" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text size="lg" fw={700}>
        {value}
      </Text>
    </Paper>
  )
}
