'use client'

import { useEffect, useState } from 'react'
import { Container, Title, Text, Stack, Card, Center, Button, Group, Badge, Loader, Grid } from '@mantine/core'
import { IconBookmark, IconDownload, IconClock, IconFileText } from '@tabler/icons-react'
import { SummaryWithBook } from '@/lib/types/summaries'
import { SUMMARY_STYLE_OPTIONS, SUMMARY_LENGTH_OPTIONS } from '@/lib/types/preferences'

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<SummaryWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/summaries')

      if (!response.ok) {
        throw new Error('Failed to fetch summaries')
      }

      const data = await response.json()
      setSummaries(data.summaries || [])
    } catch (err) {
      console.error('Error fetching summaries:', err)
      setError('Failed to load summaries')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (summaryId: string, bookTitle: string) => {
    try {
      const response = await fetch(`/api/v1/summaries/${summaryId}/download`)

      if (!response.ok) {
        throw new Error('Failed to download summary')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
    } catch (err) {
      console.error('Error downloading summary:', err)
    }
  }

  const getStyleLabel = (style: string) => {
    return SUMMARY_STYLE_OPTIONS.find(opt => opt.value === style)?.label || style
  }

  const getLengthLabel = (length: string) => {
    return SUMMARY_LENGTH_OPTIONS.find(opt => opt.value === length)?.label || length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

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

        {loading ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" type="dots" />
                <Text c="dimmed">Loading your summaries...</Text>
              </Stack>
            </Center>
          </Card>
        ) : error ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <Text c="red" size="lg">{error}</Text>
                <Button onClick={fetchSummaries}>Try Again</Button>
              </Stack>
            </Center>
          </Card>
        ) : summaries.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconBookmark size={48} stroke={1.5} style={{ opacity: 0.5 }} />
                <Text size="lg" fw={500}>No Summaries Yet</Text>
                <Text size="sm" c="dimmed" ta="center" maw={400}>
                  Generate your first book summary from the Library page
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <Grid>
            {summaries.map((summary) => (
              <Grid.Col key={summary.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Stack gap="md" h="100%">
                    <div>
                      <Text fw={600} size="lg" lineClamp={2}>
                        {summary.book?.title || 'Unknown Book'}
                      </Text>
                      <Text size="sm" c="dimmed" mb="xs">
                        by {summary.book?.author || 'Unknown Author'}
                      </Text>
                    </div>

                    <Group gap="xs">
                      <Badge variant="light" color="blue">
                        {getStyleLabel(summary.style)}
                      </Badge>
                      <Badge variant="light" color="green">
                        {getLengthLabel(summary.length)}
                      </Badge>
                    </Group>

                    <Stack gap="xs" style={{ fontSize: '0.875rem' }}>
                      <Group gap="xs">
                        <IconClock size={16} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed">
                          {formatDate(summary.created_at)}
                        </Text>
                      </Group>

                      {summary.generation_time && (
                        <Group gap="xs">
                          <IconFileText size={16} style={{ opacity: 0.6 }} />
                          <Text size="xs" c="dimmed">
                            Generated in {summary.generation_time}s
                          </Text>
                        </Group>
                      )}
                    </Stack>

                    <Button
                      fullWidth
                      leftSection={<IconDownload size={18} />}
                      onClick={() => handleDownload(summary.id, summary.book?.title || 'summary')}
                      mt="auto"
                    >
                      Download PDF
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  )
}
