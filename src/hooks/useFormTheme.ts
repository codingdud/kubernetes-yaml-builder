import { useMemo } from 'react';
import { formThemeRegistry } from '@/config/formThemeRegistry';
import { type FormTheme } from '@/types/enhancedForm';

/**
 * Hook for managing form themes with fallback support
 */
export function useFormTheme(themeName: string = 'default') {
  const theme = useMemo(() => {
    return formThemeRegistry.getMergedTheme(themeName);
  }, [themeName]);

  const availableThemes = useMemo(() => {
    return formThemeRegistry.getAvailableThemes();
  }, []);

  const hasTheme = useMemo(() => {
    return formThemeRegistry.hasTheme(themeName);
  }, [themeName]);

  return {
    theme,
    availableThemes,
    hasTheme,
    isValidTheme: hasTheme,
  };
}

/**
 * Hook for registering custom themes
 */
export function useFormThemeRegistry() {
  const registerTheme = (name: string, theme: FormTheme) => {
    formThemeRegistry.registerTheme(name, theme);
  };

  const getTheme = (name: string) => {
    return formThemeRegistry.getTheme(name);
  };

  const getAvailableThemes = () => {
    return formThemeRegistry.getAvailableThemes();
  };

  return {
    registerTheme,
    getTheme,
    getAvailableThemes,
  };
}