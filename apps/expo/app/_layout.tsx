import '../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
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
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
