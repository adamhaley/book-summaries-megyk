'use client'

import { Modal, Stack, Text, Button, Group, ThemeIcon, Box } from '@mantine/core'
import { IconCoins, IconAlertCircle } from '@tabler/icons-react'
import { formatCredits } from '@/lib/types/credits'

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

        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Get more credits:
          </Text>
          <Text size="xs" c="dimmed">
            Credit packages and subscriptions will be available soon. Stay tuned for updates!
          </Text>
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
