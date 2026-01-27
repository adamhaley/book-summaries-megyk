'use client'

import { Container, Title, Text, Stack } from '@mantine/core'
import { UserProfile } from '@clerk/nextjs'
import { InstallAppSection } from '@/components/pwa'

export default function ProfilePage() {
  return (
    <Container size="xl" pt="0" pb="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Profile Settings
          </Title>
          <Text size="lg" c="dimmed">
            Manage your account settings
          </Text>
        </div>

        <UserProfile routing="hash" />

        {/* Install App Section */}
        <InstallAppSection />
      </Stack>
    </Container>
  )
}
