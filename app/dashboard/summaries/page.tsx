'use client'

import { useEffect, useState } from 'react'
import { Container, Title, Text, Stack, Card, Center, Button, Group, Badge, Loader, Table, SimpleGrid, Box } from '@mantine/core'
import { IconBookmark, IconDownload } from '@tabler/icons-react'
import { SummaryWithBook } from '@/lib/types/summaries'
import { SUMMARY_STYLE_OPTIONS, SUMMARY_LENGTH_OPTIONS } from '@/lib/types/preferences'
import styles from './summaries.module.css'

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
    <Container size="xl" pt="0" pb="xl">
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
          <>
            {/* Mobile Card View */}
            <Box className={styles.mobileView}>
              <SimpleGrid cols={1} spacing="md">
                {summaries.map((summary) => (
                  <Card key={summary.id} shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                      <div>
                        <Text fw={600} size="lg">{summary.book?.title || 'Unknown Book'}</Text>
                        <Text c="dimmed" size="sm">by {summary.book?.author || 'Unknown Author'}</Text>
                      </div>

                      <Group gap="xs">
                        <Badge variant="light" color="green" size="sm">
                          {getStyleLabel(summary.style)}
                        </Badge>
                        <Badge variant="light" color="blue" size="sm">
                          {getLengthLabel(summary.length)}
                        </Badge>
                      </Group>

                      <Text size="xs" c="dimmed">
                        Generated {formatDate(summary.created_at)}
                      </Text>

                      <Button
                        size="sm"
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => handleDownload(summary.id, summary.book?.title || 'summary')}
                      >
                        Download PDF
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            {/* Desktop Table View */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.desktopView}>
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Author</Table.Th>
                      <Table.Th>Style</Table.Th>
                      <Table.Th>Length</Table.Th>
                      <Table.Th>Generated</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {summaries.map((summary) => (
                      <Table.Tr key={summary.id}>
                        <Table.Td>
                          <Text fw={600}>{summary.book?.title || 'Unknown Book'}</Text>
                        </Table.Td>
                        <Table.Td>{summary.book?.author || 'Unknown Author'}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="green" size="sm">
                            {getStyleLabel(summary.style)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="blue" size="sm">
                            {getLengthLabel(summary.length)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(summary.created_at)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconDownload size={14} />}
                            onClick={() => handleDownload(summary.id, summary.book?.title || 'summary')}
                          >
                            Download PDF
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  )
}
