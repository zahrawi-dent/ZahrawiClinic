import { createSignal, createMemo, Show, For } from 'solid-js'
import { useTheme } from '../lib/useTheme'
import ThemeSwitcher from './ThemeSwitcher'

export default function ThemeDemo() {
  const theme = useTheme()
  const [showCode, setShowCode] = createSignal(false)
  
  // Sample data for demonstration
  const sampleData = [
    { id: 1, name: 'Sample Item 1', status: 'success', priority: 'high' },
    { id: 2, name: 'Sample Item 2', status: 'warning', priority: 'medium' },
    { id: 3, name: 'Sample Item 3', status: 'error', priority: 'low' },
    { id: 4, name: 'Sample Item 4', status: 'info', priority: 'high' }
  ]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }
  
  return (
    <div class="min-h-screen theme-bg-primary theme-text-primary">
      <div class="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-4xl font-bold theme-text-primary">
              🎨 Theme System Demo
            </h1>
            <ThemeSwitcher />
          </div>
          
          <div class="theme-bg-secondary theme-border-primary border rounded-lg p-4">
            <h2 class="text-xl font-semibold theme-text-primary mb-2">
              Current Theme: {theme.themeName()}
            </h2>
            <p class="theme-text-secondary">
              {theme.themeDescription()} • Author: {theme.themeAuthor()} • Version: {theme.themeVersion()}
            </p>
            <p class="theme-text-tertiary mt-2">
              This demo showcases the robust theming system with CSS custom properties, 
              theme switching, and custom theme creation.
            </p>
          </div>
        </div>
        
        {/* Theme Information */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-4 theme-shadow-md">
            <h3 class="font-semibold theme-text-primary mb-2">Background Colors</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded theme-bg-primary border"></div>
                <span class="text-sm theme-text-secondary">Primary</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded theme-bg-secondary border"></div>
                <span class="text-sm theme-text-secondary">Secondary</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded theme-bg-tertiary border"></div>
                <span class="text-sm theme-text-secondary">Tertiary</span>
              </div>
            </div>
          </div>
          
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-4 theme-shadow-md">
            <h3 class="font-semibold theme-text-primary mb-2">Text Colors</h3>
            <div class="space-y-2">
              <div class="text-sm theme-text-primary">Primary Text</div>
              <div class="text-sm theme-text-secondary">Secondary Text</div>
              <div class="text-sm theme-text-tertiary">Tertiary Text</div>
              <div class="text-sm theme-text-accent">Accent Text</div>
            </div>
          </div>
          
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-4 theme-shadow-md">
            <h3 class="font-semibold theme-text-primary mb-2">Interactive Colors</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-blue-500"></div>
                <span class="text-sm theme-text-secondary">Primary</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-green-500"></div>
                <span class="text-sm theme-text-secondary">Success</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-yellow-500"></div>
                <span class="text-sm theme-text-secondary">Warning</span>
              </div>
            </div>
          </div>
          
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-4 theme-shadow-md">
            <h3 class="font-semibold theme-text-primary mb-2">Shadows</h3>
            <div class="space-y-2">
              <div class="h-8 theme-bg-surface theme-shadow-sm rounded"></div>
              <div class="h-8 theme-bg-surface theme-shadow-md rounded"></div>
              <div class="h-8 theme-bg-surface theme-shadow-lg rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Sample UI Components */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Form Section */}
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-6 theme-shadow-lg">
            <h3 class="text-xl font-semibold theme-text-primary mb-4">Form Elements</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium theme-text-primary mb-2">
                  Sample Input
                </label>
                <input
                  type="text"
                  placeholder="Enter some text..."
                  class="w-full px-3 py-2 theme-bg-primary theme-border-primary border rounded-md theme-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium theme-text-primary mb-2">
                  Sample Select
                </label>
                <select class="w-full px-3 py-2 theme-bg-primary theme-border-primary border rounded-md theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium theme-text-primary mb-2">
                  Sample Textarea
                </label>
                <textarea
                  placeholder="Enter a longer text..."
                  rows={3}
                  class="w-full px-3 py-2 theme-bg-primary theme-border-primary border rounded-md theme-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <div class="flex gap-4">
                <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Primary Button
                </button>
                <button class="px-4 py-2 theme-bg-secondary theme-text-primary hover:theme-bg-tertiary rounded-md transition-colors">
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
          
          {/* Data Display Section */}
          <div class="theme-bg-surface theme-border-primary border rounded-lg p-6 theme-shadow-lg">
            <h3 class="text-xl font-semibold theme-text-primary mb-4">Data Display</h3>
            
            <div class="space-y-3">
              <For each={sampleData}>
                {(item) => (
                  <div class="theme-bg-primary theme-border-secondary border rounded-lg p-3 theme-shadow-sm">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-medium theme-text-primary">{item.name}</h4>
                        <div class="flex items-center gap-2 mt-1">
                          <span class={`text-sm ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                          <span class={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button class="p-2 theme-text-secondary hover:theme-text-primary transition-colors">
                          ✏️
                        </button>
                        <button class="p-2 theme-text-secondary hover:theme-text-primary transition-colors">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
        
        {/* Code Display */}
        <div class="theme-bg-surface theme-border-primary border rounded-lg p-6 theme-shadow-lg mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold theme-text-primary">Theme Code</h3>
            <button
              onClick={() => setShowCode(!showCode())}
              class="px-3 py-1 theme-bg-secondary theme-text-primary rounded-md hover:theme-bg-tertiary transition-colors"
            >
              {showCode() ? 'Hide' : 'Show'} Code
            </button>
          </div>
          
          <Show when={showCode()}>
            <div class="theme-bg-primary theme-border-secondary border rounded-lg p-4 overflow-x-auto">
              <pre class="text-sm theme-text-secondary font-mono">
{`// Current Theme: ${theme.themeName()}
{
  "name": "${theme.themeName()}",
  "description": "${theme.themeDescription()}",
  "author": "${theme.themeAuthor()}",
  "version": "${theme.themeVersion()}",
  "isDark": ${theme.isDark()},
  "colors": {
    "background": {
      "primary": "${theme.getThemeColor('background', 'primary')}",
      "secondary": "${theme.getThemeColor('background', 'secondary')}",
      "tertiary": "${theme.getThemeColor('background', 'tertiary')}"
    },
    "text": {
      "primary": "${theme.getThemeColor('text', 'primary')}",
      "secondary": "${theme.getThemeColor('text', 'secondary')}",
      "accent": "${theme.getThemeColor('text', 'accent')}"
    }
  }
}`}
              </pre>
            </div>
          </Show>
        </div>
        
        {/* Theme Features */}
        <div class="theme-bg-secondary theme-border-primary border rounded-lg p-6 theme-shadow-md">
          <h3 class="text-xl font-semibold theme-text-primary mb-4">Theme System Features</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">🎨</div>
              <h4 class="font-semibold theme-text-primary mb-2">CSS Custom Properties</h4>
              <p class="text-sm theme-text-secondary">
                All theme values are applied as CSS custom properties for optimal performance
              </p>
            </div>
            
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">🔄</div>
              <h4 class="font-semibold theme-text-primary mb-2">Real-time Switching</h4>
              <p class="text-sm theme-text-secondary">
                Switch between themes instantly with smooth transitions
              </p>
            </div>
            
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">💾</div>
              <h4 class="font-semibold theme-text-primary mb-2">Persistent Storage</h4>
              <p class="text-sm theme-text-secondary">
                Theme preferences are saved in localStorage
              </p>
            </div>
            
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">📤</div>
              <h4 class="font-semibold theme-text-primary mb-2">Import/Export</h4>
              <p class="text-sm theme-text-secondary">
                Share themes by exporting to JSON and importing from files
              </p>
            </div>
            
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">✨</div>
              <h4 class="font-semibold theme-text-primary mb-2">Custom Themes</h4>
              <p class="text-sm theme-text-secondary">
                Create your own themes with the theme builder
              </p>
            </div>
            
            <div class="theme-bg-surface theme-border-secondary border rounded-lg p-4">
              <div class="text-2xl mb-2">♿</div>
              <h4 class="font-semibold theme-text-primary mb-2">Accessibility</h4>
              <p class="text-sm theme-text-secondary">
                High contrast themes and proper focus states
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div class="text-center theme-text-tertiary mt-12">
          <p>This theme system provides a robust foundation for consistent, accessible, and beautiful user interfaces.</p>
          <p class="mt-2">Use the theme switcher above to explore different themes and see how they affect the entire interface.</p>
        </div>
      </div>
    </div>
  )
}
