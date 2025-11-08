'use client'

import { useState, useEffect } from 'react'
import { Card, Group, Stack, Text, Button, Alert, Slider, Box, Loader, Center } from '@mantine/core'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import {
  UserPreferences,
  SUMMARY_STYLE_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  DEFAULT_PREFERENCES,
  SummaryStyle,
  SummaryLength
} from '@/lib/types/preferences'

export function PreferencesForm() {
  const [styleIndex, setStyleIndex] = useState(
    SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.style)
  )
  const [lengthIndex, setLengthIndex] = useState(
    SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.length)
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const style = SUMMARY_STYLE_OPTIONS[styleIndex].value as SummaryStyle
  const length = SUMMARY_LENGTH_OPTIONS[lengthIndex].value as SummaryLength

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
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
          return // Use cached data, skip API call
        } catch (e) {
          // Invalid cache, continue to fetch
          sessionStorage.removeItem('user_preferences')
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/v1/profile', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          // Cache the preferences
          sessionStorage.setItem('user_preferences', JSON.stringify(data.preferences))

          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === data.preferences.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === data.preferences.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
        }
      } else {
        console.error('Failed to fetch preferences:', response.status, response.statusText)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timeout - using default preferences')
      } else {
        console.error('Error fetching preferences:', error)
      }
      // Continue with default preferences on error
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: { style, length }
        }),
      })

      if (response.ok) {
        // Update cache with new preferences
        sessionStorage.setItem('user_preferences', JSON.stringify({ style, length }))
        setSuccessMessage('Preferences saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setErrorMessage('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" type="dots" />
            <Text c="dimmed">Loading preferences...</Text>
          </Stack>
        </Center>
      </Card>
    )
  }

  return (
    <Stack gap="lg">
      {successMessage && (
        <Alert icon={<IconCheck size={16} />} color="green" title="Success">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {errorMessage}
        </Alert>
      )}

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xl">
          <div>
            <Text size="lg" fw={600} mb="xs">
              Summary Style
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Choose how you want your book summaries presented
            </Text>
          </div>
          <Box px="md" pb="md">
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
                markLabel: { marginTop: 8, whiteSpace: 'nowrap' },
                bar: { backgroundColor: '#00D2FF', opacity: 0.8 },
                thumb: { 
                  borderColor: '#00D2FF',
                  backgroundColor: '#00D2FF',
                  opacity: 0.8
                }
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
            <Text fw={600} size="lg" mb="xs">
              {SUMMARY_STYLE_OPTIONS[styleIndex].label}
            </Text>
            <Text size="md" c="dimmed">
              {SUMMARY_STYLE_OPTIONS[styleIndex].description}
            </Text>
          </Box>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xl">
          <div>
            <Text size="lg" fw={600} mb="xs">
              Summary Length
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Select your preferred max summary length
            </Text>
          </div>
          <Box px="md" pb="md">
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
                markLabel: { marginTop: 8, whiteSpace: 'nowrap' },
                bar: { backgroundColor: '#00D2FF', opacity: 0.8 },
                thumb: { 
                  borderColor: '#00D2FF',
                  backgroundColor: '#00D2FF',
                  opacity: 0.8
                }
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
            <Text fw={600} size="lg" mb="xs">
              {SUMMARY_LENGTH_OPTIONS[lengthIndex].label}
            </Text>
            <Text size="md" c="dimmed">
              {SUMMARY_LENGTH_OPTIONS[lengthIndex].description}
            </Text>
          </Box>
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button
          onClick={savePreferences}
          loading={saving}
          size="md"
        >
          Save Preferences
        </Button>
      </Group>
    </Stack>
  )
}
