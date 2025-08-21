import { createSignal, createEffect, onCleanup } from 'solid-js'
import { themeManager, type Theme } from './theme-system'

export function useTheme() {
  const [currentTheme, setCurrentTheme] = createSignal<Theme>(themeManager.getCurrentTheme())
  const [availableThemes, setAvailableThemes] = createSignal<Theme[]>(themeManager.getThemes())
  
  // Subscribe to theme changes
  createEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme)
      setAvailableThemes(themeManager.getThemes())
    })
    
    onCleanup(unsubscribe)
  })
  
  // Theme management functions
  const applyTheme = (themeName: string): boolean => {
    return themeManager.applyTheme(themeName)
  }
  
  const toggleDarkMode = () => {
    themeManager.toggleDarkMode()
  }
  
  const resetToDefault = () => {
    themeManager.resetToDefault()
  }
  
  const createCustomTheme = (themeData: Partial<Theme>): Theme => {
    return themeManager.createCustomTheme(themeData)
  }
  
  const registerTheme = (theme: Theme) => {
    themeManager.registerTheme(theme)
    setAvailableThemes(themeManager.getThemes())
  }
  
  const exportTheme = (themeName: string): string | null => {
    return themeManager.exportTheme(themeName)
  }
  
  const importTheme = (jsonString: string): boolean => {
    const success = themeManager.importTheme(jsonString)
    if (success) {
      setAvailableThemes(themeManager.getThemes())
    }
    return success
  }
  
  // Utility functions
  const getThemeColor = (category: keyof Theme['colors'], name: string): string => {
    const theme = currentTheme()
    return theme.colors[category][name as keyof typeof theme.colors[typeof category]]
  }
  
  const getThemeSpacing = (name: string): string => {
    const theme = currentTheme()
    return theme.spacing[name as keyof Theme['spacing']]
  }
  
  const getThemeFontSize = (name: string): string => {
    const theme = currentTheme()
    return theme.typography.fontSize[name as keyof Theme['typography']['fontSize']]
  }
  
  const getThemeShadow = (name: string): string => {
    const theme = currentTheme()
    return theme.shadows[name as keyof Theme['shadows']]
  }
  
  const getThemeBorderRadius = (name: string): string => {
    const theme = currentTheme()
    return theme.borderRadius[name as keyof Theme['borderRadius']]
  }
  
  return {
    // State
    currentTheme,
    availableThemes,
    
    // Actions
    applyTheme,
    toggleDarkMode,
    resetToDefault,
    createCustomTheme,
    registerTheme,
    exportTheme,
    importTheme,
    
    // Utilities
    getThemeColor,
    getThemeSpacing,
    getThemeFontSize,
    getThemeShadow,
    getThemeBorderRadius,
    
    // Computed values
    isDark: () => currentTheme().isDark || false,
    themeName: () => currentTheme().name,
    themeDescription: () => currentTheme().description || '',
    themeAuthor: () => currentTheme().author || '',
    themeVersion: () => currentTheme().version || ''
  }
}
