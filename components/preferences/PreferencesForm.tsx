'use client'

import { useState, useEffect } from 'react'
import { Card, Group, Stack, Text, Button, Alert, Slider, Box } from '@mantine/core'
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
      const response = await fetch('/api/v1/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          const styleIdx = SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === data.preferences.style)
          const lengthIdx = SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === data.preferences.length)
          if (styleIdx !== -1) setStyleIndex(styleIdx)
          if (lengthIdx !== -1) setLengthIndex(lengthIdx)
        }
      } else {
        console.error('Failed to fetch preferences')
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
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
        <Text>Loading preferences...</Text>
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
          <Box>
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
                markLabel: { marginTop: 8 }
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
              Select your preferred summary depth
            </Text>
          </div>
          <Box>
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
                markLabel: { marginTop: 8 }
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
