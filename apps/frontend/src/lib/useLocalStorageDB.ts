import { createEffect, onCleanup, createSignal } from "solid-js"
import { 
  localStorageItemsCollection, 
  localStorageCategoriesCollection, 
  localStorageManager,
  type LocalStorageItem,
  type LocalStorageCategory
} from './tanstack-db-localstorage'

// Hook for items collection
export function useLocalStorageItems() {
  const [items, setItems] = createSignal<LocalStorageItem[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  
  const refetch = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = localStorageManager.getItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
    } finally {
      setIsLoading(false)
    }
  }
  
  createEffect(() => {
    refetch()
  })
  
  return {
    data: items,
    isLoading,
    error,
    refetch
  }
}

// Hook for categories collection
export function useLocalStorageCategories() {
  const [categories, setCategories] = createSignal<LocalStorageCategory[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  
  const refetch = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = localStorageManager.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }
  
  createEffect(() => {
    refetch()
  })
  
  return {
    data: categories,
    isLoading,
    error,
    refetch
  }
}

// Hook for real-time sync simulation
export function useLocalStorageSync() {
  createEffect(() => {
    const cleanup = localStorageManager.subscribe(() => {
      // Trigger refetch when localStorage changes
      // The collections will automatically update through their hooks
    })
    
    onCleanup(cleanup)
  })
}

// Hook for statistics
export function useLocalStorageStats() {
  const [stats, setStats] = createSignal(localStorageManager.getStats())
  
  createEffect(() => {
    const cleanup = localStorageManager.subscribe(() => {
      setStats(localStorageManager.getStats())
    })
    
    onCleanup(cleanup)
  })
  
  return stats
}

// Hook for search functionality
export function useLocalStorageSearch() {
  const [searchQuery, setSearchQuery] = createSignal('')
  const [searchResults, setSearchResults] = createSignal<LocalStorageItem[]>([])
  
  createEffect(() => {
    const query = searchQuery()
    if (query.trim()) {
      setSearchResults(localStorageManager.searchItems(query))
    } else {
      setSearchResults([])
    }
  })
  
  return {
    searchQuery,
    setSearchQuery,
    searchResults
  }
}

// Hook for filtered items
export function useLocalStorageFilteredItems() {
  const [filter, setFilter] = createSignal<{
    category?: string
    priority?: LocalStorageItem['priority']
    completed?: boolean
  }>({})
  
  const [filteredItems, setFilteredItems] = createSignal<LocalStorageItem[]>([])
  
  createEffect(() => {
    const currentFilter = filter()
    let items = localStorageManager.getItems()
    
    if (currentFilter.category) {
      items = items.filter(item => item.category === currentFilter.category)
    }
    
    if (currentFilter.priority) {
      items = items.filter(item => item.priority === currentFilter.priority)
    }
    
    if (currentFilter.completed !== undefined) {
      items = items.filter(item => item.completed === currentFilter.completed)
    }
    
    setFilteredItems(items)
  })
  
  return {
    filter,
    setFilter,
    filteredItems
  }
}

// Hook for category management
export function useLocalStorageCategoryManagement() {
  const createCategory = (category: Omit<LocalStorageCategory, 'id' | 'itemCount'>) => {
    try {
      const newCategory = localStorageManager.createCategory(category)
      // Trigger updates through the manager's subscription system
      return { success: true, data: newCategory }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const updateCategory = (id: string, changes: Partial<LocalStorageCategory>) => {
    try {
      const updated = localStorageManager.updateCategory(id, changes)
      if (updated) {
        // Trigger updates through the manager's subscription system
        return { success: true, data: updated }
      }
      return { success: false, error: 'Category not found' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const deleteCategory = (id: string) => {
    try {
      const deleted = localStorageManager.deleteCategory(id)
      if (deleted) {
        // Trigger updates through the manager's subscription system
        return { success: true }
      }
      return { success: false, error: 'Category not found' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  return {
    createCategory,
    updateCategory,
    deleteCategory
  }
}

// Hook for item management
export function useLocalStorageItemManagement() {
  const createItem = (item: Omit<LocalStorageItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem = localStorageManager.createItem(item)
      // Trigger updates through the manager's subscription system
      return { success: true, data: newItem }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const updateItem = (id: string, changes: Partial<LocalStorageItem>) => {
    try {
      const updated = localStorageManager.updateItem(id, changes)
      if (updated) {
        // Trigger updates through the manager's subscription system
        return { success: true, data: updated }
      }
      return { success: false, error: 'Item not found' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const deleteItem = (id: string) => {
    try {
      const deleted = localStorageManager.deleteItem(id)
      if (deleted) {
        // Trigger updates through the manager's subscription system
        return { success: true }
      }
      return { success: false, error: 'Item not found' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const toggleItemCompletion = (id: string) => {
    const item = localStorageManager.getItem(id)
    if (item) {
      return updateItem(id, { completed: !item.completed })
    }
    return { success: false, error: 'Item not found' }
  }
  
  return {
    createItem,
    updateItem,
    deleteItem,
    toggleItemCompletion
  }
}

// Export the manager for direct access
export { localStorageManager }
