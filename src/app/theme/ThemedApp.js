'use client';
import { Theme } from '@radix-ui/themes';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemedApp({ children }) {
  const { radixThemeProps, isHydrated } = useTheme();
  
  
  if (!isHydrated) {
    return (
      <Theme appearance="light" accentColor="blue" scaling="100%">
        {children}
      </Theme>
    );
  }

  return (
    <Theme {...radixThemeProps}>
      {children}
    </Theme>
  );
}