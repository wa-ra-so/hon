import { Alert, Platform } from 'react-native';

/**
 * react-native-web の Alert は空実装のため、Webでは window.alert / confirm に
 * フォールバックする。ネイティブでは従来どおり Alert を使う。
 */
export function notify(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmDestructive(options: {
  title: string;
  message: string;
  actionLabel: string;
  onConfirm: () => void;
}): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${options.title}\n${options.message}`)) options.onConfirm();
    return;
  }
  Alert.alert(options.title, options.message, [
    { text: 'キャンセル', style: 'cancel' },
    { text: options.actionLabel, style: 'destructive', onPress: options.onConfirm },
  ]);
}
