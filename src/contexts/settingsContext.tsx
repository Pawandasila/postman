"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Mode = 'light' | 'dark' | 'system';

export interface Settings {
  mode: Mode;
  theme: {
    styles?: {
      light: Record<string, any>;
      dark: Record<string, any>;
    };
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    mode: 'dark',
    theme: {
      styles: {
        light: {},
        dark: {},
      },
    },
  });

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings', JSON.stringify(newSettings));
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
