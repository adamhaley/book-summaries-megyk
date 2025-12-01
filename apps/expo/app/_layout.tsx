import '../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#264653',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Megyk Books',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth/signin"
            options={{
              title: 'Sign In',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{
              title: 'Sign Up',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="dashboard/library"
            options={{
              title: 'Library',
            }}
          />
          <Stack.Screen
            name="dashboard/summaries"
            options={{
              title: 'My Summaries',
            }}
          />
          <Stack.Screen
            name="dashboard/preferences"
            options={{
              title: 'Preferences',
            }}
          />
          <Stack.Screen
            name="dashboard/profile"
            options={{
              title: 'Profile',
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
