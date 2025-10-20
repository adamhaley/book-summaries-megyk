'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stepper,
  Button,
  Group,
  Card,
  Stack,
  Text,
  Title,
  Container,
  Alert,
  Slider,
  Box
} from '@mantine/core'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import {
  SummaryStyle,
  SummaryLength,
  SUMMARY_STYLE_OPTIONS,
  SUMMARY_LENGTH_OPTIONS,
  DEFAULT_PREFERENCES
} from '@/lib/types/preferences'
import styles from './OnboardingWizard.module.css'

export function OnboardingWizard() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [styleIndex, setStyleIndex] = useState(
    SUMMARY_STYLE_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.style)
  )
  const [lengthIndex, setLengthIndex] = useState(
    SUMMARY_LENGTH_OPTIONS.findIndex(opt => opt.value === DEFAULT_PREFERENCES.length)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const style = SUMMARY_STYLE_OPTIONS[styleIndex].value as SummaryStyle
  const length = SUMMARY_LENGTH_OPTIONS[lengthIndex].value as SummaryLength

  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current))
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  const handleComplete = async () => {
    setSaving(true)
    setError(null)

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
        // Redirect to dashboard after successful save
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save preferences')
        setSaving(false)
      }
    } catch (err) {
      console.error('Error saving preferences:', err)
      setError('An unexpected error occurred')
      setSaving(false)
    }
  }

  return (
    <Container size="md" py="xl" className={styles.responsiveContainer}>
      <Card shadow="lg" padding="xl" radius="md" withBorder className={styles.responsiveCard}>
        <Stack gap="xl">
          <div>
            <Title order={1} mb="xs">
              Welcome to Megyk Book Summaries
            </Title>
            <Text size="lg" c="dimmed">
              Let's personalize your reading experience
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <Stepper active={active} onStepClick={setActive} className={styles.mobileStepper}>
            <Stepper.Step label="Welcome" description="Get started">
              <Stack gap="md" mt="xl">
                <Text size="lg">
                  Thank you for joining Megyk Book Summaries! We're excited to help you discover and understand books faster.
                </Text>
                <Text>
                  In the next steps, we'll ask you a few questions to personalize your summary experience.
                </Text>
                <Text fw={500}>
                  This will only take a minute.
                </Text>
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Style" description="Choose format">
              <Stack gap="md" mt="xl">
                <div>
                  <Text size="lg" fw={600} mb="sm">
                    How would you like your summaries presented?
                  </Text>
                  <Text size="sm" c="dimmed" mb="lg">
                    You can always change this later in your preferences
                  </Text>
                </div>

                <Card padding="xl" withBorder className={styles.responsiveSliderCard}>
                  <Stack gap="xl">
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
                          markLabel: { 
                            marginTop: 8,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }
                        }}
                        className="mobile-slider"
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
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Length" description="Choose depth">
              <Stack gap="md" mt="xl">
                <div>
                  <Text size="lg" fw={600} mb="sm">
                    How detailed should your summaries be?
                  </Text>
                  <Text size="sm" c="dimmed" mb="lg">
                    You can always change this later in your preferences
                  </Text>
                </div>

                <Card padding="xl" withBorder className={styles.responsiveSliderCard}>
                  <Stack gap="xl">
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
                          markLabel: { 
                            marginTop: 8,
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }
                        }}
                        className="mobile-slider"
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
              </Stack>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md" mt="xl" align="center">
                <IconCheck size={48} color="green" />
                <Title order={2}>All Set!</Title>
                <Text size="lg" ta="center">
                  Your preferences have been saved. You're ready to start exploring book summaries.
                </Text>
              </Stack>
            </Stepper.Completed>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={active === 0}>
              Back
            </Button>
            {active < 2 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} loading={saving}>
                Complete & Continue
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}
