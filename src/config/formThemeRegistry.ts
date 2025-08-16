import { type RegistryWidgetsType } from '@rjsf/utils';
import { type FormTheme } from '@/types/enhancedForm';
import KeyValueWidget from '@/components/forms/widgets/KeyValueWidget';

// Base widgets that are always available
const baseWidgets: RegistryWidgetsType = {
  KeyValueWidget,
};

// Default theme configuration (matches existing DynamicK8sForm)
export const defaultTheme: FormTheme = {
  widgets: baseWidgets,
};

// Enhanced theme configuration (will be expanded in future tasks)
export const enhancedTheme: FormTheme = {
  widgets: {
    ...baseWidgets,
    // Enhanced widgets will be added in future tasks
  },
  // Templates and fields will be added in future tasks
};

// Theme registry for managing different themes
export class FormThemeRegistry {
  private themes: Map<string, FormTheme> = new Map();

  constructor() {
    // Register default themes
    this.registerTheme('default', defaultTheme);
    this.registerTheme('enhanced', enhancedTheme);
  }

  // Register a new theme
  registerTheme(name: string, theme: FormTheme): void {
    this.themes.set(name, theme);
  }

  // Get a theme by name with fallback to default
  getTheme(name: string): FormTheme {
    const theme = this.themes.get(name);
    if (!theme) {
      console.warn(`Theme '${name}' not found, falling back to default theme`);
      return this.themes.get('default') || defaultTheme;
    }
    return theme;
  }

  // Merge theme with base configuration and provide fallbacks
  getMergedTheme(name: string): FormTheme {
    const theme = this.getTheme(name);
    
    return {
      widgets: { ...baseWidgets, ...theme.widgets },
      templates: theme.templates,
      fields: theme.fields,
    };
  }

  // Get list of available themes
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  // Check if a theme exists
  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }
}

// Global theme registry instance
export const formThemeRegistry = new FormThemeRegistry();