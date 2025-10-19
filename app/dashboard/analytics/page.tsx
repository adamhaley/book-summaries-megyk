import { Container, Title, Text, Stack, Card, Center } from '@mantine/core'
import { IconChartBar } from '@tabler/icons-react'

export default function AnalyticsPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Analytics
          </Title>
          <Text size="lg" c="dimmed">
            Track your reading progress and summary usage
          </Text>
        </div>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconChartBar size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" fw={500}>Analytics Page</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                This page is under construction. Analytics and insights will be available soon.
              </Text>
            </Stack>
          </Center>
        </Card>
      </Stack>
    </Container>
  )
}
