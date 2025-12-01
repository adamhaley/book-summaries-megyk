import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Container, VStack } from '../../components/layout';
import { useTheme } from '../../theme';

export default function SignInScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Check for specific error types
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email. Check your inbox for the verification link.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        // Successful sign in - redirect to dashboard library
        router.replace('/dashboard/library');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Sign In
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.gray[600],
                textAlign: 'center',
                marginTop: theme.spacing[2],
              }}
            >
              Welcome back to Megyk Books
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

          {/* Sign In Form */}
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
              autoComplete="password"
              testID="password-input"
              accessibilityLabel="Password input"
            />

            <Button
              title={loading ? 'Signing in...' : 'Sign In'}
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password || loading}
              fullWidth
              size="lg"
              testID="signin-button"
            />
          </VStack>

          {/* Sign Up Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing[4] }}>
            <Text style={{ fontSize: 14, color: theme.colors.gray[600] }}>
              Don't have an account?{' '}
            </Text>
            <Link href="/auth/signup" asChild>
              <Pressable>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.primary.DEFAULT,
                    fontWeight: '600',
                  }}
                >
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </VStack>
      </Container>
    </ScrollView>
  );
}
