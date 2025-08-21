import { createCollection } from "@tanstack/solid-db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { queryClient } from './queryClient'

// Types for LocalStorage demo data
export interface LocalStorageItem {
  id: string
  name: string
  description?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface LocalStorageCategory {
  id: string
  name: string
  color: string
  itemCount: number
}

// LocalStorage utility functions
const STORAGE_KEYS = {
  ITEMS: 'tanstack-db-demo-items',
  CATEGORIES: 'tanstack-db-demo-categories',
  LAST_SYNC: 'tanstack-db-demo-last-sync'
}

class LocalStorageManager {
  private static instance: LocalStorageManager
  private listeners: Set<() => void> = new Set()

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  // Initialize with demo data if empty
  initializeDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      const demoItems: LocalStorageItem[] = [
        {
          id: '1',
          name: 'Complete project documentation',
          description: 'Write comprehensive documentation for the TanStack DB implementation',
          category: 'work',
          priority: 'high',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Review code changes',
          description: 'Go through recent commits and review for improvements',
          category: 'development',
          priority: 'medium',
          completed: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Plan next sprint',
          description: 'Organize tasks and priorities for the upcoming development cycle',
          category: 'planning',
          priority: 'high',
          completed: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(demoItems))
    }

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      const demoCategories: LocalStorageCategory[] = [
        { id: 'work', name: 'Work', color: '#3B82F6', itemCount: 1 },
        { id: 'development', name: 'Development', color: '#10B981', itemCount: 1 },
        { id: 'planning', name: 'Planning', color: '#F59E0B', itemCount: 1 },
        { id: 'personal', name: 'Personal', color: '#8B5CF6', itemCount: 0 }
      ]
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(demoCategories))
    }
  }

  // CRUD operations for items
  getItems(): LocalStorageItem[] {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.ITEMS)
      return items ? JSON.parse(items) : []
    } catch {
      return []
    }
  }

  getItem(id: string): LocalStorageItem | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  createItem(item: Omit<LocalStorageItem, 'id' | 'createdAt' | 'updatedAt'>): LocalStorageItem {
    const newItem: LocalStorageItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const items = this.getItems()
    items.push(newItem)
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
    
    this.updateCategoryCount(item.category, 1)
    this.notifyListeners()
    
    return newItem
  }

  updateItem(id: string, changes: Partial<LocalStorageItem>): LocalStorageItem | null {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return null
    
    const oldItem = items[index]
    const updatedItem: LocalStorageItem = {
      ...oldItem,
      ...changes,
      updatedAt: new Date().toISOString()
    }
    
    items[index] = updatedItem
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
    
    // Update category count if category changed
    if (changes.category && changes.category !== oldItem.category) {
      this.updateCategoryCount(oldItem.category, -1)
      this.updateCategoryCount(changes.category, 1)
    }
    
    this.notifyListeners()
    return updatedItem
  }

  deleteItem(id: string): boolean {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return false
    
    const item = items[index]
    items.splice(index, 1)
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
    
    this.updateCategoryCount(item.category, -1)
    this.notifyListeners()
    
    return true
  }

  // CRUD operations for categories
  getCategories(): LocalStorageCategory[] {
    try {
      const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      return categories ? JSON.parse(categories) : []
    } catch {
      return []
    }
  }

  createCategory(category: Omit<LocalStorageCategory, 'id' | 'itemCount'>): LocalStorageCategory {
    const newCategory: LocalStorageCategory = {
      ...category,
      id: this.generateId(),
      itemCount: 0
    }
    
    const categories = this.getCategories()
    categories.push(newCategory)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    
    this.notifyListeners()
    return newCategory
  }

  updateCategory(id: string, changes: Partial<LocalStorageCategory>): LocalStorageCategory | null {
    const categories = this.getCategories()
    const index = categories.findIndex(cat => cat.id === id)
    
    if (index === -1) return null
    
    const updatedCategory: LocalStorageCategory = {
      ...categories[index],
      ...changes
    }
    
    categories[index] = updatedCategory
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    
    this.notifyListeners()
    return updatedCategory
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories()
    const index = categories.findIndex(cat => cat.id === id)
    
    if (index === -1) return false
    
    // Check if category has items
    const items = this.getItems()
    const hasItems = items.some(item => item.category === id)
    
    if (hasItems) {
      throw new Error('Cannot delete category with existing items')
    }
    
    categories.splice(index, 1)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    
    this.notifyListeners()
    return true
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private updateCategoryCount(categoryId: string, delta: number) {
    const categories = this.getCategories()
    const category = categories.find(cat => cat.id === categoryId)
    
    if (category) {
      category.itemCount = Math.max(0, category.itemCount + delta)
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
  }

  // Real-time sync simulation
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Randomly trigger updates for demo purposes
      if (Math.random() < 0.1) { // 10% chance every interval
        this.notifyListeners()
      }
    }, 5000) // Check every 5 seconds
    
    return () => {
      this.listeners.delete(callback)
      clearInterval(interval)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback())
  }

  // Search and filtering
  searchItems(query: string): LocalStorageItem[] {
    const items = this.getItems()
    const lowerQuery = query.toLowerCase()
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    )
  }

  getItemsByCategory(categoryId: string): LocalStorageItem[] {
    return this.getItems().filter(item => item.category === categoryId)
  }

  getItemsByPriority(priority: LocalStorageItem['priority']): LocalStorageItem[] {
    return this.getItems().filter(item => item.priority === priority)
  }

  getCompletedItems(): LocalStorageItem[] {
    return this.getItems().filter(item => item.completed)
  }

  getPendingItems(): LocalStorageItem[] {
    return this.getItems().filter(item => !item.completed)
  }

  // Statistics
  getStats() {
    const items = this.getItems()
    const categories = this.getCategories()
    
    return {
      totalItems: items.length,
      completedItems: items.filter(item => item.completed).length,
      pendingItems: items.filter(item => !item.completed).length,
      totalCategories: categories.length,
      priorityBreakdown: {
        low: items.filter(item => item.priority === 'low').length,
        medium: items.filter(item => item.priority === 'medium').length,
        high: items.filter(item => item.priority === 'high').length
      },
      categoryBreakdown: categories.map(cat => ({
        name: cat.name,
        count: cat.itemCount,
        color: cat.color
      }))
    }
  }
}

// Create singleton instance
export const localStorageManager = LocalStorageManager.getInstance()

// Initialize demo data
localStorageManager.initializeDemoData()

// Create TanStack DB collections
export const localStorageItemsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['localStorage-items'],
    queryClient: queryClient,
    queryFn: async () => {
      return localStorageManager.getItems()
    },
    getKey: (item: LocalStorageItem) => item.id,

    // Mutation handlers
    onInsert: async ({ transaction }) => {
      const { modified: newItem } = transaction.mutations[0]
      const created = localStorageManager.createItem(newItem as any)
      return { refetch: false, data: created }
    },

    onUpdate: async ({ transaction }) => {
      const { key, changes } = transaction.mutations[0]
      const updated = localStorageManager.updateItem(key, changes as any)
      return { refetch: false, data: updated }
    },

    onDelete: async ({ transaction }) => {
      const { key } = transaction.mutations[0]
      const deleted = localStorageManager.deleteItem(key)
      return { refetch: false, data: deleted }
    }
  })
)

export const localStorageCategoriesCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['localStorage-categories'],
    queryClient: queryClient,
    queryFn: async () => {
      return localStorageManager.getCategories()
    },
    getKey: (item: LocalStorageCategory) => item.id,

    // Mutation handlers
    onInsert: async ({ transaction }) => {
      const { modified: newItem } = transaction.mutations[0]
      const created = localStorageManager.createCategory(newItem as any)
      return { refetch: false, data: created }
    },

    onUpdate: async ({ transaction }) => {
      const { key, changes } = transaction.mutations[0]
      const updated = localStorageManager.updateCategory(key, changes as any)
      return { refetch: false, data: updated }
    },

    onDelete: async ({ transaction }) => {
      const { key } = transaction.mutations[0]
      const deleted = localStorageManager.deleteCategory(key)
      return { refetch: false, data: deleted }
    }
  })
)

// Export the manager for direct access
export { LocalStorageManager }
