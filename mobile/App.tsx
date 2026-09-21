import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TextInput, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Onest_800ExtraBold,
  Onest_900Black,
} from '@expo-google-fonts/onest';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/theme';

// Inject global web font and stylesheet for Web target
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const fontStyle = document.createElement('style');
  fontStyle.type = 'text/css';
  fontStyle.appendChild(
    document.createTextNode(`
      @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&display=swap');
      * {
        font-family: 'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      }
    `)
  );
  document.head.appendChild(fontStyle);
}

// Set default font family globally for React Native Text & TextInput
// @ts-ignore
if (Text.defaultProps == null) {
  // @ts-ignore
  Text.defaultProps = {};
}
// @ts-ignore
Text.defaultProps.style = { fontFamily: 'Onest_400Regular' };

// @ts-ignore
if (TextInput.defaultProps == null) {
  // @ts-ignore
  TextInput.defaultProps = {};
}
// @ts-ignore
TextInput.defaultProps.style = { fontFamily: 'Onest_400Regular' };

export default function App() {
  const [fontsLoaded] = useFonts({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    Onest_800ExtraBold,
    Onest_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
