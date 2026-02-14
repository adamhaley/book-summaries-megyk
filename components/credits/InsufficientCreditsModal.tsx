'use client'

import { useRouter } from 'next/navigation'
import { Modal, Stack, Text, Button, Group, ThemeIcon, Box, Paper } from '@mantine/core'
import { IconCoins, IconAlertCircle, IconGift, IconUsers } from '@tabler/icons-react'
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
  const router = useRouter()
  const shortfall = requiredCredits - currentBalance

  const handleInviteFriends = () => {
    onClose()
    router.push('/dashboard/profile')
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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

        {/* Referral CTA */}
        <Paper
          p="md"
          radius="md"
          style={{
            background: 'linear-gradient(135deg, var(--mantine-color-violet-0) 0%, var(--mantine-color-indigo-0) 100%)',
            border: '1px solid var(--mantine-color-violet-2)',
          }}
        >
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size="xl" radius="md" variant="light" color="violet">
              <IconGift size={24} />
            </ThemeIcon>
            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="sm" fw={600}>
                Earn free credits by inviting friends!
              </Text>
              <Text size="xs" c="dimmed">
                Earn more MC's! Get <Text span fw={700} c="violet">{REFERRAL_REWARDS.referrer_bonus.toLocaleString()} MC</Text> per friend who joins and activates their account.
              </Text>
            </Stack>
          </Group>
          <Button
            fullWidth
            mt="md"
            variant="gradient"
            gradient={{ from: 'violet', to: 'indigo' }}
            leftSection={<IconUsers size={18} />}
            onClick={handleInviteFriends}
          >
            Invite Friends
          </Button>
        </Paper>

        <Text size="xs" c="dimmed" ta="center">
          Subscription plans coming soon!
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
