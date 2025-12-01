import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Container, VStack } from '../../components/layout';
import { useTheme } from '../../theme';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Container size="sm" padding="lg">
          <VStack spacing={theme.spacing[6]} style={{ marginTop: theme.spacing[12] }}>
            <View>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: theme.colors.gray[900],
                  textAlign: 'center',
                }}
              >
                Check Your Email
              </Text>
            </View>

            <View
              style={{
                padding: theme.spacing[4],
                backgroundColor: theme.colors.primary.light || '#E0F2FE',
                borderRadius: theme.borderRadius.DEFAULT,
                borderWidth: 1,
                borderColor: theme.colors.primary.DEFAULT,
              }}
            >
              <Text style={{ color: theme.colors.primary.DEFAULT, fontSize: 16, textAlign: 'center' }}>
                We've sent a verification link to {email}. Please check your inbox and click the link to activate your account.
              </Text>
            </View>

            <Button
              title="Back to Sign In"
              onPress={() => router.replace('/auth/signin')}
              fullWidth
              size="lg"
            />
          </VStack>
        </Container>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container size="sm" padding="lg">
        <VStack spacing={theme.spacing[6]} style={{ marginTop: theme.spacing[12] }}>
          {/* Page Title */}
          <View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: theme.colors.gray[900],
                textAlign: 'center',
              }}
            >
              Sign Up
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.gray[600],
                textAlign: 'center',
                marginTop: theme.spacing[2],
              }}
            >
              Create your Megyk Books account
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View
              style={{
                padding: theme.spacing[3],
                backgroundColor: theme.colors.error.light || '#FEE2E2',
                borderRadius: theme.borderRadius.DEFAULT,
                borderWidth: 1,
                borderColor: theme.colors.error.DEFAULT,
              }}
            >
              <Text style={{ color: theme.colors.error.DEFAULT, fontSize: 14 }}>
                {error}
              </Text>
            </View>
          )}

          {/* Sign Up Form */}
          <VStack spacing={theme.spacing[4]}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="email-input"
              accessibilityLabel="Email input"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              testID="password-input"
              accessibilityLabel="Password input"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              testID="confirm-password-input"
              accessibilityLabel="Confirm password input"
            />

            <Button
              title={loading ? 'Creating account...' : 'Sign Up'}
              onPress={handleSignUp}
              loading={loading}
              disabled={!email || !password || !confirmPassword || loading}
              fullWidth
              size="lg"
            />
          </VStack>

          {/* Sign In Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing[4] }}>
            <Text style={{ fontSize: 14, color: theme.colors.gray[600] }}>
              Already have an account?{' '}
            </Text>
            <Link href="/auth/signin" asChild>
              <Pressable>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.primary.DEFAULT,
                    fontWeight: '600',
                  }}
                >
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </VStack>
      </Container>
    </ScrollView>
  );
}
