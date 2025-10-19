import { Container, Title, Text, Stack, Card, Center } from '@mantine/core'
import { IconBookmark } from '@tabler/icons-react'

export default function SummariesPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            My Summaries
          </Title>
          <Text size="lg" c="dimmed">
            Access all your personalized book summaries
          </Text>
        </div>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconBookmark size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="lg" fw={500}>My Summaries Page</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                This page is under construction. Your saved summaries will appear here once generated.
              </Text>
            </Stack>
          </Center>
        </Card>
      </Stack>
    </Container>
  )
}
