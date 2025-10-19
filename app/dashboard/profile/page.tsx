import { Container, Title, Text, Stack, Card, Center } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'

export default function ProfilePage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Profile
          </Title>
          <Text size="lg" c="dimmed">
            View and manage your profile information
          </Text>
        </div>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconUser size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" fw={500}>Profile Page</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                This page is under construction. Profile management features will be added soon.
              </Text>
            </Stack>
          </Center>
        </Card>
      </Stack>
    </Container>
  )
}
