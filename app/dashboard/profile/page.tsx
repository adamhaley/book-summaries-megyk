'use client'

import { useEffect, useState } from 'react'
import { Container, Title, Text, Stack, Card, TextInput, PasswordInput, Button, Alert } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      setEmail(user.email || '')
      setNewEmail(user.email || '')
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Email updated successfully! Please check your new email for confirmation.')
      setEmail(newEmail)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setLoadingPassword(false)
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setLoadingPassword(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setPasswordError(error.message)
        return
      }

      setPasswordSuccess('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <Container size="md" pt="0" pb="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Profile Settings
          </Title>
          <Text size="lg" c="dimmed" ta="right">
            Manage your account email and password
          </Text>
        </div>

        {/* Email Update Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={600} size="lg" mb="xs">
                Email Address
              </Text>
              <Text size="sm" c="dimmed">
                Update your email address
              </Text>
            </div>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert icon={<IconCheck size={16} />} color="green" title="Success">
                {success}
              </Alert>
            )}

            <form onSubmit={handleUpdateEmail}>
              <Stack gap="md">
                <TextInput
                  label="Current Email"
                  value={email}
                  disabled
                  description="Your current email address"
                />

                <TextInput
                  label="New Email"
                  type="email"
                  placeholder="your@newemail.com"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />

                <Button type="submit" loading={loading} disabled={newEmail === email}>
                  Update Email
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>

        {/* Password Update Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={600} size="lg" mb="xs">
                Password
              </Text>
              <Text size="sm" c="dimmed">
                Change your password
              </Text>
            </div>

            {passwordError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert icon={<IconCheck size={16} />} color="green" title="Success">
                {passwordSuccess}
              </Alert>
            )}

            <form onSubmit={handleUpdatePassword}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="At least 6 characters"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" loading={loadingPassword}>
                  Update Password
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
