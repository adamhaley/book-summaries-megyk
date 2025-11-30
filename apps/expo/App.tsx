import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-white text-2xl font-bold mb-4">
        Megyk Books
      </Text>
      <Text className="text-neutral-light text-base">
        Cross-platform with NativeWind + Expo
      </Text>
      <StatusBar style="light" />
    </View>
  );
}
