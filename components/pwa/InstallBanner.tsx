'use client';

import { useState } from 'react';
import { Paper, Group, Text, Button, CloseButton, Stack, Box } from '@mantine/core';
import { IconDownload, IconDeviceMobile } from '@tabler/icons-react';
import { useInstallPrompt } from './useInstallPrompt';

export function InstallBanner() {
  const { isInstallable, isIOS, install, dismiss, isDismissed, isInstalled } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await install();
    }
  };

  if (showIOSInstructions) {
    return (
      <Paper
        shadow="lg"
        p="md"
        radius="md"
        withBorder
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 1000,
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        <Group justify="space-between" align="flex-start" mb="xs">
          <Text fw={600} size="sm">Install Megyk Books</Text>
          <CloseButton size="sm" onClick={() => setShowIOSInstructions(false)} />
        </Group>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            To install on iOS:
          </Text>
          <Text size="sm">
            1. Tap the <strong>Share</strong> button <Box component="span" style={{ display: 'inline-block', border: '1px solid #ccc', borderRadius: 4, padding: '0 4px', fontSize: 12 }}>↑</Box>
          </Text>
          <Text size="sm">
            2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
          </Text>
          <Button variant="light" size="xs" mt="xs" onClick={dismiss}>
            Got it
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      shadow="lg"
      p="sm"
      radius="md"
      withBorder
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <IconDeviceMobile size={24} style={{ flexShrink: 0, opacity: 0.7 }} />
          <Text size="sm" lineClamp={2}>
            Install app for offline access
          </Text>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="filled"
            leftSection={<IconDownload size={14} />}
            onClick={handleInstall}
          >
            Install
          </Button>
          <CloseButton size="sm" onClick={dismiss} />
        </Group>
      </Group>
    </Paper>
  );
}
