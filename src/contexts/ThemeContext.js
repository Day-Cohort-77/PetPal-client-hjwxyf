'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const THEME_STORAGE_KEY = 'petpal-theme-settings';

const defaultThemeSettings = {
  theme: 'light',
  accentColor: 'blue',
  fontSize: 'medium',
};

// Helper functions DIDNT WANT TO CHANGE API
function mapAccentColorToColorAccent(accentColor) {
  const colorMap = {
    'blue': '#4a90e2',
    'green': '#4caf50',
    'purple': '#9c27b0',
    'orange': '#ff9800',
    'red': '#f44336'
  };
  return colorMap[accentColor] || '#4a90e2';
}

function mapColorAccentToAccentColor(colorAccent) {
  const colorMap = {
    '#4a90e2': 'blue',
    '#4caf50': 'green',
    '#9c27b0': 'purple',
    '#ff9800': 'orange',
    '#f44336': 'red'
  };
  return colorMap[colorAccent] || 'blue';
}

export function ThemeProvider({ children }) {
  const [themeSettings, setThemeSettings] = useState(defaultThemeSettings);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading } = useAuth();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        setThemeSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Load user's theme from API when they log in
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user || loading) return;

      try {
        console.log('🎨 Loading user theme from server...');
        const response = await fetch('http://localhost:5000/api/theme-settings', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.preferences) {
            const serverSettings = {
              theme: data.preferences.theme || 'light',
              accentColor: mapColorAccentToAccentColor(data.preferences.colorAccent),
              fontSize: data.preferences.fontSize || 'medium'
            };

            setThemeSettings(serverSettings);
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(serverSettings));
            console.log('User theme loaded from server:', serverSettings);
          }
        } else if (response.status === 404) {
          console.log('No saved theme found, using defaults');
        }
      } catch (error) {
        console.error(' Error loading user theme:', error);
      }
    };

    loadUserTheme();
  }, [user, loading]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeSettings));
    }
  }, [themeSettings, isHydrated]);

  
  // Reset to defaults on log out
  useEffect(() => {
    if (!user && !loading && isHydrated) {
      console.log('User logged out, resetting theme to defaults');
      setThemeSettings(defaultThemeSettings);
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  }, [user, loading, isHydrated]);

  const updateTheme = (property, value) => {
    setThemeSettings(prev => ({ ...prev, [property]: value }));
  };

  // save theme to server CALLED from Settings page
  const saveThemeToServer = async () => {
    if (!user) throw new Error('User not logged in');

    const response = await fetch('http://localhost:5000/api/theme-settings', { // Add full URL here too
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: themeSettings.theme,
        colorAccent: mapAccentColorToColorAccent(themeSettings.accentColor),
        fontSize: themeSettings.fontSize,
        useSystemPreference: themeSettings.theme === 'system'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save theme settings');
    }

    console.log('Theme settings saved to server');
    return response.json();
  };

  const getRadixThemeProps = () => {
    let appearance = themeSettings.theme;
    if (themeSettings.theme === 'system' && typeof window !== 'undefined') {
      appearance = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return {
      appearance,
      accentColor: themeSettings.accentColor,
      scaling: themeSettings.fontSize === 'small' ? '90%' :
        themeSettings.fontSize === 'large' ? '110%' : '100%'
    };
  };

  return (
    <ThemeContext.Provider value={{
      themeSettings,
      updateTheme,
      saveThemeToServer, //  save function for Settings page
      isHydrated,
      radixThemeProps: getRadixThemeProps()
    }}>
      {children}
    </ThemeContext.Provider>
  );
}