'use client'

import { useState, useEffect } from 'react'
import { Modal, Stack, Text, Button, Slider, Box, Loader, Center, Alert } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconSparkles, IconCheck } from '@tabler/icons-react'
import {
  UserPreferences,
  SUMMARY_STYLE_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  DEFAULT_PREFERENCES,
  SummaryStyle,
  SummaryLength
} from '@/lib/types/preferences'
import { Book } from '@/lib/types/books'

interface GenerateSummaryModalProps {
  opened: boolean
  onClose: () => void
  book: Book | null
}

export function GenerateSummaryModal({ opened, onClose, book }: GenerateSummaryModalProps) {
  const [styleIndex, setStyleIndex] = useState(
    SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.style)
  )
  const [lengthIndex, setLengthIndex] = useState(
    SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.length)
  )
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const style = SUMMARY_STYLE_OPTIONS[styleIndex].value as SummaryStyle
  const length = SUMMARY_LENGTH_OPTIONS[lengthIndex].value as SummaryLength

  useEffect(() => {
    if (opened) {
      fetchPreferences()
    }
  }, [opened])

  const fetchPreferences = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // Check if we have cached preferences in sessionStorage
      const cached = sessionStorage.getItem('user_preferences')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === cachedData.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === cachedData.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
          setLoading(false)
          return
        } catch (e) {
          sessionStorage.removeItem('user_preferences')
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/api/v1/profile', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          sessionStorage.setItem('user_preferences', JSON.stringify(data.preferences))

          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === data.preferences.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === data.preferences.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timeout - using default preferences')
      } else {
        console.error('Error fetching preferences:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!book) return

    setGenerating(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/v1/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: book.id,
          preferences: { style, length }
        }),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''

        // Check if response is a PDF
        if (contentType.includes('application/pdf')) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `book-summary-${book.id}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)

          notifications.show({
            title: 'Summary Generated!',
            message: `Your personalized summary for "${book.title}" has been downloaded.`,
            color: 'green',
            icon: <IconCheck size={18} />,
            autoClose: 5000,
          })

          onClose() // Close modal on success
        } else {
          // Handle JSON response (async processing)
          const data = await response.json()
          console.log('Summary generation started:', data)

          notifications.show({
            title: 'Summary Generation Started',
            message: `Your personalized summary for "${book.title}" is being generated. You'll be notified when it's ready.`,
            color: 'green',
            icon: <IconCheck size={18} />,
            autoClose: 5000,
          })

          onClose() // Close modal on success
        }
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Failed to generate summary')
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      setErrorMessage('An unexpected error occurred')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700}>
          Generate Summary
        </Text>
      }
      size="lg"
      centered
      styles={{
        body: {
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 120px)',
        },
        content: {
          overflow: 'hidden',
        },
        inner: {
          padding: '20px',
        },
      }}
      scrollAreaComponent="div"
    >
      <Stack gap="md" style={{ overflow: 'hidden' }}>
        {book && (
          <Box
            p="md"
            style={{
              backgroundColor: 'var(--mantine-color-default-hover)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text fw={600} size="lg" mb="xs">
              {book.title}
            </Text>
            <Text size="sm" c="dimmed">
              by {book.author}
            </Text>
          </Box>
        )}

        {errorMessage && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" type="dots" />
              <Text c="dimmed">Loading preferences...</Text>
            </Stack>
          </Center>
        ) : generating ? (
          <Center py="xl">
            <Stack align="center" gap="lg">
              <Loader size="xl" type="dots" />
              <Stack align="center" gap="xs">
                <Text size="lg" fw={600}>
                  Generating Your Personalized Summary
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={400}>
                  AI is analyzing "{book?.title}" and creating a custom summary based on your preferences. This may take 30-60 seconds...
                </Text>
              </Stack>
            </Stack>
          </Center>
        ) : (
          <>
            <Stack gap="md">
              <div>
                <Text size="md" fw={600} mb="xs">
                  Summary Style
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  Choose how you want your book summary presented
                </Text>
              </div>
              <Box px="xs" pb="md">
                <Slider
                  value={styleIndex}
                  onChange={setStyleIndex}
                  min={0}
                  max={SUMMARY_STYLE_OPTIONS.length - 1}
                  step={1}
                  marks={SUMMARY_STYLE_OPTIONS.map((option, index) => ({
                    value: index,
                    label: option.label
                  }))}
                  size="lg"
                  styles={{
                    markLabel: { marginTop: 8, whiteSpace: 'nowrap', fontSize: '0.75rem' }
                  }}
                />
              </Box>
              <Box
                p="md"
                style={{
                  backgroundColor: 'var(--mantine-color-default-hover)',
                  borderRadius: 'var(--mantine-radius-md)',
                  textAlign: 'center'
                }}
              >
                <Text fw={600} size="md" mb="xs">
                  {SUMMARY_STYLE_OPTIONS[styleIndex].label}
                </Text>
                <Text size="sm" c="dimmed">
                  {SUMMARY_STYLE_OPTIONS[styleIndex].description}
                </Text>
              </Box>
            </Stack>

            <Stack gap="md">
              <div>
                <Text size="md" fw={600} mb="xs">
                  Summary Length
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  Select your preferred max summary length
                </Text>
              </div>
              <Box px="xs" pb="md">
                <Slider
                  value={lengthIndex}
                  onChange={setLengthIndex}
                  min={0}
                  max={SUMMARY_LENGTH_OPTIONS.length - 1}
                  step={1}
                  marks={SUMMARY_LENGTH_OPTIONS.map((option, index) => ({
                    value: index,
                    label: option.label
                  }))}
                  size="lg"
                  styles={{
                    markLabel: { marginTop: 8, whiteSpace: 'nowrap', fontSize: '0.75rem' }
                  }}
                />
              </Box>
              <Box
                p="md"
                style={{
                  backgroundColor: 'var(--mantine-color-default-hover)',
                  borderRadius: 'var(--mantine-radius-md)',
                  textAlign: 'center'
                }}
              >
                <Text fw={600} size="md" mb="xs">
                  {SUMMARY_LENGTH_OPTIONS[lengthIndex].label}
                </Text>
                <Text size="sm" c="dimmed">
                  {SUMMARY_LENGTH_OPTIONS[lengthIndex].description}
                </Text>
              </Box>
            </Stack>

            <Button
              fullWidth
              size="md"
              leftSection={<IconSparkles size={18} />}
              onClick={handleGenerate}
              loading={generating}
              disabled={!book}
            >
              Generate Summary
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  )
}
