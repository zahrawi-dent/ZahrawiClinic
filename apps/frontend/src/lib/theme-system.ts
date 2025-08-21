// Theme system for the application
export interface ThemeColors {
  // Background colors
  background: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    surface: string
    overlay: string
  }
  
  // Text colors
  text: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    inverse: string
    muted: string
  }
  
  // Border colors
  border: {
    primary: string
    secondary: string
    accent: string
    muted: string
  }
  
  // Interactive colors
  interactive: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  
  // Status colors
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
  
  // Special colors
  special: {
    highlight: string
    shadow: string
    glow: string
  }
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

export interface ThemeTypography {
  fontFamily: {
    sans: string
    serif: string
    mono: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  fontWeight: {
    light: string
    normal: string
    medium: string
    semibold: string
    bold: string
    extrabold: string
  }
  lineHeight: {
    tight: string
    normal: string
    relaxed: string
  }
}

export interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  full: string
}

export interface ThemeTransitions {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    linear: string
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

export interface Theme {
  name: string
  description?: string
  author?: string
  version?: string
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  shadows: ThemeShadows
  borderRadius: ThemeBorderRadius
  transitions: ThemeTransitions
  isDark?: boolean
}

// Default theme (light)
export const defaultTheme: Theme = {
  name: 'Default Light',
  description: 'Clean and modern light theme',
  author: 'System',
  version: '1.0.0',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      accent: '#e2e8f0',
      surface: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      accent: '#3b82f6',
      inverse: '#ffffff',
      muted: '#94a3b8'
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#f1f5f9',
      accent: '#3b82f6',
      muted: '#f8fafc'
    },
    interactive: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    special: {
      highlight: '#fef3c7',
      shadow: 'rgba(0, 0, 0, 0.1)',
      glow: 'rgba(59, 130, 246, 0.5)'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      serif: 'Georgia, Cambria, serif',
      mono: 'JetBrains Mono, Consolas, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  isDark: false
}

// Dark theme
export const darkTheme: Theme = {
  name: 'Dark',
  description: 'Elegant dark theme for low-light environments',
  author: 'System',
  version: '1.0.0',
  colors: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      accent: '#475569',
      surface: '#1e293b',
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      accent: '#60a5fa',
      inverse: '#0f172a',
      muted: '#64748b'
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      accent: '#60a5fa',
      muted: '#1e293b'
    },
    interactive: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee'
    },
    status: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee'
    },
    special: {
      highlight: '#451a03',
      shadow: 'rgba(0, 0, 0, 0.3)',
      glow: 'rgba(96, 165, 250, 0.5)'
    }
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    none: 'none'
  },
  borderRadius: defaultTheme.borderRadius,
  transitions: defaultTheme.transitions,
  isDark: true
}

// High contrast theme
export const highContrastTheme: Theme = {
  name: 'High Contrast',
  description: 'High contrast theme for accessibility',
  author: 'System',
  version: '1.0.0',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#333333',
      accent: '#ffffff',
      surface: '#000000',
      overlay: 'rgba(255, 255, 255, 0.9)'
    },
    text: {
      primary: '#ffffff',
      secondary: '#e6e6e6',
      tertiary: '#cccccc',
      accent: '#ffff00',
      inverse: '#000000',
      muted: '#999999'
    },
    border: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#ffff00',
      muted: '#666666'
    },
    interactive: {
      primary: '#ffff00',
      secondary: '#ffffff',
      success: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0000',
      info: '#00ffff'
    },
    status: {
      success: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0000',
      info: '#00ffff'
    },
    special: {
      highlight: '#ffff00',
      shadow: 'rgba(255, 255, 255, 0.5)',
      glow: 'rgba(255, 255, 0, 0.8)'
    }
  },
  spacing: defaultTheme.spacing,
  typography: defaultTheme.typography,
  shadows: {
    sm: '0 1px 2px 0 rgba(255, 255, 255, 0.3)',
    md: '0 4px 6px -1px rgba(255, 255, 255, 0.4)',
    lg: '0 10px 15px -3px rgba(255, 255, 255, 0.4)',
    xl: '0 20px 25px -5px rgba(255, 255, 255, 0.4)',
    '2xl': '0 25px 50px -12px rgba(255, 255, 255, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.2)',
    none: 'none'
  },
  borderRadius: defaultTheme.borderRadius,
  transitions: defaultTheme.transitions,
  isDark: true
}

// Theme manager class
export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: Theme
  private themes: Map<string, Theme>
  private listeners: Set<(theme: Theme) => void> = new Set()
  
  private constructor() {
    this.themes = new Map()
    this.currentTheme = defaultTheme
    
    // Register default themes
    this.registerTheme(defaultTheme)
    this.registerTheme(darkTheme)
    this.registerTheme(highContrastTheme)
    
    // Load saved theme from localStorage
    this.loadSavedTheme()
  }
  
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }
  
  // Register a new theme
  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme)
  }
  
  // Get all available themes
  getThemes(): Theme[] {
    return Array.from(this.themes.values())
  }
  
  // Get current theme
  getCurrentTheme(): Theme {
    return this.currentTheme
  }
  
  // Apply a theme
  applyTheme(themeName: string): boolean {
    const theme = this.themes.get(themeName)
    if (!theme) return false
    
    this.currentTheme = theme
    this.applyThemeToDOM(theme)
    this.saveTheme(themeName)
    this.notifyListeners(theme)
    
    return true
  }
  
  // Apply theme to DOM
  private applyThemeToDOM(theme: Theme): void {
    const root = document.documentElement
    const style = root.style
    
    // Apply colors
    Object.entries(theme.colors).forEach(([category, colors]) => {
      Object.entries(colors).forEach(([name, value]) => {
        style.setProperty(`--color-${category}-${name}`, value)
      })
    })
    
    // Apply spacing
    Object.entries(theme.spacing).forEach(([name, value]) => {
      style.setProperty(`--spacing-${name}`, value)
    })
    
    // Apply typography
    Object.entries(theme.typography.fontFamily).forEach(([name, value]) => {
      style.setProperty(`--font-family-${name}`, value)
    })
    Object.entries(theme.typography.fontSize).forEach(([name, value]) => {
      style.setProperty(`--font-size-${name}`, value)
    })
    Object.entries(theme.typography.fontWeight).forEach(([name, value]) => {
      style.setProperty(`--font-weight-${name}`, value)
    })
    Object.entries(theme.typography.lineHeight).forEach(([name, value]) => {
      style.setProperty(`--line-height-${name}`, value)
    })
    
    // Apply shadows
    Object.entries(theme.shadows).forEach(([name, value]) => {
      style.setProperty(`--shadow-${name}`, value)
    })
    
    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([name, value]) => {
      style.setProperty(`--border-radius-${name}`, value)
    })
    
    // Apply transitions
    Object.entries(theme.transitions.duration).forEach(([name, value]) => {
      style.setProperty(`--transition-duration-${name}`, value)
    })
    Object.entries(theme.transitions.easing).forEach(([name, value]) => {
      style.setProperty(`--transition-easing-${name}`, value)
    })
    
    // Apply dark mode class
    if (theme.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Set theme name as data attribute
    root.setAttribute('data-theme', theme.name.toLowerCase().replace(/\s+/g, '-'))
  }
  
  // Save theme preference
  private saveTheme(themeName: string): void {
    try {
      localStorage.setItem('app-theme', themeName)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }
  
  // Load saved theme
  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('app-theme')
      if (savedTheme && this.themes.has(savedTheme)) {
        this.applyTheme(savedTheme)
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error)
    }
  }
  
  // Subscribe to theme changes
  subscribe(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback)
    
    // Call immediately with current theme
    callback(this.currentTheme)
    
    return () => {
      this.listeners.delete(callback)
    }
  }
  
  // Notify listeners of theme change
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(callback => callback(theme))
  }
  
  // Create custom theme from user input
  createCustomTheme(themeData: Partial<Theme>): Theme {
    const customTheme: Theme = {
      name: themeData.name || 'Custom Theme',
      description: themeData.description || 'User-created custom theme',
      author: themeData.author || 'User',
      version: themeData.version || '1.0.0',
      colors: { ...defaultTheme.colors, ...themeData.colors },
      spacing: { ...defaultTheme.spacing, ...themeData.spacing },
      typography: { ...defaultTheme.typography, ...themeData.typography },
      shadows: { ...defaultTheme.shadows, ...themeData.shadows },
      borderRadius: { ...defaultTheme.borderRadius, ...themeData.borderRadius },
      transitions: { ...defaultTheme.transitions, ...themeData.transitions },
      isDark: themeData.isDark || false
    }
    
    return customTheme
  }
  
  // Export theme to JSON
  exportTheme(themeName: string): string | null {
    const theme = this.themes.get(themeName)
    if (!theme) return null
    
    return JSON.stringify(theme, null, 2)
  }
  
  // Import theme from JSON
  importTheme(jsonString: string): boolean {
    try {
      const themeData = JSON.parse(jsonString)
      const theme = this.createCustomTheme(themeData)
      
      this.registerTheme(theme)
      return true
    } catch (error) {
      console.error('Failed to import theme:', error)
      return false
    }
  }
  
  // Reset to default theme
  resetToDefault(): void {
    this.applyTheme(defaultTheme.name)
  }
  
  // Toggle between light and dark themes
  toggleDarkMode(): void {
    const currentTheme = this.getCurrentTheme()
    if (currentTheme.isDark) {
      this.applyTheme(defaultTheme.name)
    } else {
      this.applyTheme(darkTheme.name)
    }
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance()

// Utility functions
export function getThemeColor(category: keyof ThemeColors, name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${category}-${name}`)
    .trim()
}

export function getThemeSpacing(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--spacing-${name}`)
    .trim()
}

export function getThemeFontSize(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-size-${name}`)
    .trim()
}

export function getThemeShadow(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--shadow-${name}`)
    .trim()
}
