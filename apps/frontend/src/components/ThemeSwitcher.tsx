import { createSignal, Show, For, createEffect } from 'solid-js'
import { useTheme } from '../lib/useTheme'
import type { Theme } from '../lib/theme-system'

export default function ThemeSwitcher() {
  const theme = useTheme()
  const [showThemeMenu, setShowThemeMenu] = createSignal(false)
  const [showCustomThemeModal, setShowCustomThemeModal] = createSignal(false)
  const [showImportModal, setShowImportModal] = createSignal(false)
  const [customThemeData, setCustomThemeData] = createSignal({
    name: '',
    description: '',
    author: '',
    isDark: false
  })
  const [importJson, setImportJson] = createSignal('')
  const [importError, setImportError] = createSignal('')
  
  // Quick theme toggle
  const handleQuickToggle = () => {
    theme.toggleDarkMode()
  }
  
  // Apply theme
  const handleThemeChange = (themeName: string) => {
    theme.applyTheme(themeName)
    setShowThemeMenu(false)
  }
  
  // Create custom theme
  const handleCreateCustomTheme = () => {
    if (!customThemeData().name.trim()) return
    
    const newTheme = theme.createCustomTheme({
      ...customThemeData(),
      colors: customThemeData().isDark ? 
        { ...theme.currentTheme().colors } : 
        { ...theme.currentTheme().colors }
    })
    
    theme.registerTheme(newTheme)
    theme.applyTheme(newTheme.name)
    setShowCustomThemeModal(false)
    setCustomThemeData({ name: '', description: '', author: '', isDark: false })
  }
  
  // Import theme
  const handleImportTheme = () => {
    if (!importJson().trim()) return
    
    setImportError('')
    const success = theme.importTheme(importJson())
    
    if (success) {
      setShowImportModal(false)
      setImportJson('')
    } else {
      setImportError('Invalid theme JSON format')
    }
  }
  
  // Export current theme
  const handleExportTheme = () => {
    const themeJson = theme.exportTheme(theme.themeName())
    if (themeJson) {
      const blob = new Blob([themeJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${theme.themeName().toLowerCase().replace(/\s+/g, '-')}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  
  // Reset to default
  const handleResetTheme = () => {
    if (confirm('Are you sure you want to reset to the default theme?')) {
      theme.resetToDefault()
    }
  }
  
  return (
    <div class="relative">
      {/* Quick Toggle Button */}
      <button
        onClick={handleQuickToggle}
        class="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        title={theme.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme.isDark() ? '☀️' : '🌙'}
      </button>
      
      {/* Theme Menu Button */}
      <button
        onClick={() => setShowThemeMenu(!showThemeMenu())}
        class="ml-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        title="Theme Options"
      >
        🎨
      </button>
      
      {/* Theme Menu Dropdown */}
      <Show when={showThemeMenu()}>
        <div class="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Theme Settings</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Current: {theme.themeName()}
            </p>
          </div>
          
          {/* Available Themes */}
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
            <h4 class="font-medium text-slate-900 dark:text-white mb-3">Available Themes</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <For each={theme.availableThemes()}>
                {(availableTheme) => (
                  <button
                    onClick={() => handleThemeChange(availableTheme.name)}
                    class={`w-full text-left p-3 rounded-lg border transition-colors ${
                      availableTheme.name === theme.themeName()
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-medium text-slate-900 dark:text-white">
                          {availableTheme.name}
                        </div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">
                          {availableTheme.description || 'No description'}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        {availableTheme.isDark ? '🌙' : '☀️'}
                        {availableTheme.author !== 'System' && (
                          <span class="text-xs text-slate-500 dark:text-slate-500">
                            by {availableTheme.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>
          
          {/* Theme Actions */}
          <div class="p-4 space-y-3">
            <button
              onClick={() => setShowCustomThemeModal(true)}
              class="w-full p-3 text-left bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span>➕</span>
                <span class="font-medium text-green-900 dark:text-green-100">Create Custom Theme</span>
              </div>
              <div class="text-sm text-green-700 dark:text-green-300">
                Design your own theme
              </div>
            </button>
            
            <button
              onClick={() => setShowImportModal(true)}
              class="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span>📥</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">Import Theme</span>
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                Load a theme from JSON file
              </div>
            </button>
            
            <button
              onClick={handleExportTheme}
              class="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span>📤</span>
                <span class="font-medium text-purple-900 dark:text-purple-100">Export Current Theme</span>
              </div>
              <div class="text-sm text-purple-700 dark:text-purple-300">
                Save theme as JSON file
              </div>
            </button>
            
            <button
              onClick={handleResetTheme}
              class="w-full p-3 text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span>🔄</span>
                <span class="font-medium text-red-900 dark:text-red-100">Reset to Default</span>
              </div>
              <div class="text-sm text-red-700 dark:text-red-300">
                Restore system default theme
              </div>
            </button>
          </div>
        </div>
      </Show>
      
      {/* Custom Theme Modal */}
      <Show when={showCustomThemeModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Create Custom Theme
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Theme Name *
                </label>
                <input
                  type="text"
                  value={customThemeData().name}
                  onInput={(e) => setCustomThemeData({ ...customThemeData(), name: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="My Custom Theme"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={customThemeData().description}
                  onInput={(e) => setCustomThemeData({ ...customThemeData(), description: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Describe your theme..."
                  rows={3}
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={customThemeData().author}
                  onInput={(e) => setCustomThemeData({ ...customThemeData(), author: e.currentTarget.value })}
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Your Name"
                />
              </div>
              
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDark"
                  checked={customThemeData().isDark}
                  onChange={(e) => setCustomThemeData({ ...customThemeData(), isDark: e.currentTarget.checked })}
                  class="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                />
                <label for="isDark" class="text-sm text-slate-700 dark:text-slate-300">
                  Dark theme variant
                </label>
              </div>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button
                onClick={handleCreateCustomTheme}
                disabled={!customThemeData().name.trim()}
                class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-400 rounded-md text-white font-medium transition-colors"
              >
                Create Theme
              </button>
              <button
                onClick={() => setShowCustomThemeModal(false)}
                class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Import Theme Modal */}
      <Show when={showImportModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Import Theme
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Theme JSON
                </label>
                <textarea
                  value={importJson()}
                  onInput={(e) => setImportJson(e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  placeholder="Paste your theme JSON here..."
                  rows={8}
                />
              </div>
              
              <Show when={importError()}>
                <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-300">{importError()}</p>
                </div>
              </Show>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button
                onClick={handleImportTheme}
                disabled={!importJson().trim()}
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 rounded-md text-white font-medium transition-colors"
              >
                Import Theme
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
