import { Alert, Platform } from 'react-native';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Universal Alert helper compatible with React Native Android, iOS, and Web (Expo Web)
 */
export const showAppAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    const fullMsg = message ? `${title}\n\n${message}` : title;

    if (!buttons || buttons.length <= 1) {
      window.alert(fullMsg);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
      return;
    }

    // Two buttons (e.g. Cancel vs Confirm)
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    const confirmBtn = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];

    const isConfirmed = window.confirm(fullMsg);
    if (isConfirmed) {
      if (confirmBtn?.onPress) confirmBtn.onPress();
    } else {
      if (cancelBtn?.onPress) cancelBtn.onPress();
    }
    return;
  }

  // Native Platform (Android / iOS)
  Alert.alert(title, message, buttons as any);
};
