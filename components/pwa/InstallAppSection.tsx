'use client';

import { Paper, Group, Text, Button, Stack, ThemeIcon, Badge, Box } from '@mantine/core';
import { IconDownload, IconCheck, IconDeviceMobile } from '@tabler/icons-react';
import { useInstallPrompt } from './useInstallPrompt';

export function InstallAppSection() {
  const { isInstallable, isInstalled, isIOS, install } = useInstallPrompt();

  const handleInstall = async () => {
    if (!isIOS) {
      await install();
    }
  };

  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon size="xl" radius="md" variant="light">
            <IconDeviceMobile size={24} />
          </ThemeIcon>
          <Stack gap={4}>
            <Group gap="xs">
              <Text fw={600}>Install App</Text>
              {isInstalled && (
                <Badge color="green" size="sm" variant="light" leftSection={<IconCheck size={12} />}>
                  Installed
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {isInstalled
                ? 'Megyk Books is installed on your device'
                : 'Install for offline access to your summaries'}
            </Text>
          </Stack>
        </Group>

        {!isInstalled && !isIOS && (
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={handleInstall}
            disabled={!isInstallable}
          >
            Install
          </Button>
        )}
      </Group>

      {!isInstalled && isIOS && (
        <Box mt="md" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 8 }}>
          <Text size="sm" fw={500} mb="xs">
            To install on iOS:
          </Text>
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              1. Tap the <strong>Share</strong> button in Safari <Box component="span" style={{ display: 'inline-block', border: '1px solid #ccc', borderRadius: 4, padding: '0 4px', fontSize: 12 }}>↑</Box>
            </Text>
            <Text size="sm" c="dimmed">
              2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
            </Text>
          </Stack>
        </Box>
      )}

      {!isInstalled && !isIOS && !isInstallable && (
        <Text size="xs" c="dimmed" mt="sm">
          Open this page in Chrome or Safari on your mobile device to install
        </Text>
      )}
    </Paper>
  );
}
