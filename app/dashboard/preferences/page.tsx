import { Container, Title, Text, Stack } from '@mantine/core'
import { PreferencesForm } from '@/components/preferences/PreferencesForm'

export default function PreferencesPage() {
  return (
    <Container size="md" pt="0" pb="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Summary Preferences
          </Title>
          <Text size="lg" c="dimmed">
            Customize how your book summaries are generated and presented
          </Text>
        </div>

        <PreferencesForm />
      </Stack>
    </Container>
  )
}
