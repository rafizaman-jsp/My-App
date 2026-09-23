import { Alert as NativeAlert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: () => void;
};

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: unknown,
  ) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
      buttons?.[buttons.length - 1]?.onPress?.();
      return;
    }

    NativeAlert.alert(title, message, buttons, options as any);
  },
};
