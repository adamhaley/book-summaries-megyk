import { Container, Title, Text, Stack, Card, Center } from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'

export default function SettingsPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Settings
          </Title>
          <Text size="lg" c="dimmed">
            Manage your account settings and preferences
          </Text>
        </div>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconSettings size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" fw={500}>Settings Page</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                This page is under construction. Settings functionality will be added soon.
              </Text>
            </Stack>
          </Center>
        </Card>
      </Stack>
    </Container>
  )
}
