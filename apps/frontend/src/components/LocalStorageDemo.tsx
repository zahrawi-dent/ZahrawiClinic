import { createSignal, createMemo, Show, For, createEffect } from 'solid-js'
import { 
  useLocalStorageItems, 
  useLocalStorageCategories, 
  useLocalStorageSync, 
  useLocalStorageStats,
  useLocalStorageSearch,
  useLocalStorageFilteredItems,
  useLocalStorageCategoryManagement,
  useLocalStorageItemManagement
} from '../lib/useLocalStorageDB'
import type { LocalStorageItem, LocalStorageCategory } from '../lib/tanstack-db-localstorage'

export default function LocalStorageDemo() {
  // Initialize hooks
  const itemsQuery = useLocalStorageItems()
  const categoriesQuery = useLocalStorageCategories()
  const stats = useLocalStorageStats()
  const search = useLocalStorageSearch()
  const filtered = useLocalStorageFilteredItems()
  const categoryManagement = useLocalStorageCategoryManagement()
  const itemManagement = useLocalStorageItemManagement()
  
  // Enable real-time sync
  useLocalStorageSync()
  
  // Local state for forms
  const [showAddItem, setShowAddItem] = createSignal(false)
  const [showAddCategory, setShowAddCategory] = createSignal(false)
  const [editingItem, setEditingItem] = createSignal<LocalStorageItem | null>(null)
  const [editingCategory, setEditingCategory] = createSignal<LocalStorageCategory | null>(null)
  
  // Form data
  const [newItem, setNewItem] = createSignal({
    name: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    completed: false
  })
  
  const [newCategory, setNewCategory] = createSignal({
    name: '',
    color: '#3B82F6'
  })
  
  // Computed values
  const items = createMemo(() => itemsQuery.data || [])
  const categories = createMemo(() => categoriesQuery.data || [])
  const isLoading = createMemo(() => itemsQuery.isLoading || categoriesQuery.isLoading)
  const error = createMemo(() => itemsQuery.error || categoriesQuery.error)
  
  const filteredItems = createMemo(() => {
  const searchResults = search.searchResults()
  const filterResults = filtered.filteredItems()
  
  if (searchResults.length > 0) {
    return searchResults
  }
  
  if (filterResults.length > 0) {
    return filterResults
  }
  
  return items()
})
  
  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const cats = categories()
    return cats().find((c: LocalStorageCategory) => c.id === categoryId)?.name || categoryId
  }
  
  // Actions
  const handleAddItem = () => {
    if (!newItem().name || !newItem().category) return
    
    const result = itemManagement.createItem(newItem())
    if (result.success) {
      setNewItem({ name: '', description: '', category: '', priority: 'medium', completed: false })
      setShowAddItem(false)
    } else {
      alert(`Failed to create item: ${result.error}`)
    }
  }
  
  const handleAddCategory = () => {
    if (!newCategory().name) return
    
    const result = categoryManagement.createCategory(newCategory())
    if (result.success) {
      setNewCategory({ name: '', color: '#3B82F6' })
      setShowAddCategory(false)
    } else {
      alert(`Failed to create category: ${result.error}`)
    }
  }
  
  const handleUpdateItem = (id: string, changes: Partial<LocalStorageItem>) => {
    const result = itemManagement.updateItem(id, changes)
    if (!result.success) {
      alert(`Failed to update item: ${result.error}`)
    }
    setEditingItem(null)
  }
  
  const handleUpdateCategory = (id: string, changes: Partial<LocalStorageCategory>) => {
    const result = categoryManagement.updateCategory(id, changes)
    if (!result.success) {
      alert(`Failed to update category: ${result.error}`)
    }
    setEditingCategory(null)
  }
  
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const result = itemManagement.deleteItem(id)
      if (!result.success) {
        alert(`Failed to delete item: ${result.error}`)
      }
    }
  }
  
  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all items in this category.')) {
      const result = categoryManagement.deleteCategory(id)
      if (!result.success) {
        alert(`Failed to delete category: ${result.error}`)
      }
    }
  }
  
  const handleToggleCompletion = (id: string) => {
    const result = itemManagement.toggleItemCompletion(id)
    if (!result.success) {
      alert(`Failed to toggle completion: ${result.error}`)
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '🌱'
      default: return '📝'
    }
  }
  
  return (
    <div class="min-h-screen bg-slate-900 text-white p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-center">
          🗄️ TanStack DB LocalStorage Demo
        </h1>
        
        {/* Stats Dashboard */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-slate-800 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-400">Total Items</h3>
            <p class="text-3xl font-bold">{stats().totalItems}</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-green-400">Completed</h3>
            <p class="text-3xl font-bold">{stats().completedItems}</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-yellow-400">Pending</h3>
            <p class="text-3xl font-bold">{stats().pendingItems}</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-400">Categories</h3>
            <p class="text-3xl font-bold">{stats().totalCategories}</p>
          </div>
        </div>
        
        {/* Priority Breakdown */}
        <div class="bg-slate-800 p-6 rounded-lg mb-8">
          <h3 class="text-xl font-semibold mb-4">Priority Breakdown</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl mb-2">🔥</div>
              <div class="text-2xl font-bold text-red-400">{stats().priorityBreakdown.high}</div>
              <div class="text-sm text-gray-400">High Priority</div>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">⚡</div>
              <div class="text-2xl font-bold text-yellow-400">{stats().priorityBreakdown.medium}</div>
              <div class="text-sm text-gray-400">Medium Priority</div>
            </div>
            <div class="text-center">
              <div class="text-2xl mb-2">🌱</div>
              <div class="text-2xl font-bold text-green-400">{stats().priorityBreakdown.low}</div>
              <div class="text-sm text-gray-400">Low Priority</div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div class="bg-slate-800 p-6 rounded-lg mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-2">Search Items</label>
              <input
                type="text"
                placeholder="Search by name, description, or category..."
                value={search.searchQuery()}
                onInput={(e) => search.setSearchQuery(e.currentTarget.value)}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Filter by Category</label>
              <select
                value={filtered.filter().category || ''}
                onChange={(e) => filtered.setFilter({ ...filtered.filter(), category: e.currentTarget.value || undefined })}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="">All Categories</option>
                <For each={categories()()}>
                  {(category: LocalStorageCategory) => (
                    <option value={category.id}>{category.name}</option>
                  )}
                </For>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Filter by Priority</label>
              <select
                value={filtered.filter().priority || ''}
                onChange={(e) => filtered.setFilter({ ...filtered.filter(), priority: e.currentTarget.value as any || undefined })}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Filter by Status</label>
              <select
                value={filtered.filter().completed === undefined ? '' : filtered.filter().completed ? 'completed' : 'pending'}
                onChange={(e) => {
                  const value = e.currentTarget.value
                  filtered.setFilter({ 
                    ...filtered.filter(), 
                    completed: value === '' ? undefined : value === 'completed' 
                  })
                }}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                onClick={() => filtered.setFilter({})}
                class="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div class="flex gap-4 mb-8">
          <button
            onClick={() => setShowAddItem(true)}
            class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
          >
            ➕ Add Item
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            class="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
          >
            🏷️ Add Category
          </button>
        </div>
        
        {/* Loading and Error States */}
        <Show when={isLoading()}>
          <div class="text-center py-8">
            <div class="text-2xl mb-2">⏳</div>
            <p class="text-gray-400">Loading data...</p>
          </div>
        </Show>
        
        <Show when={error()}>
          <div class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error()()}
          </div>
        </Show>
        
        {/* Items List */}
        <div class="bg-slate-800 rounded-lg overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-700">
            <h2 class="text-2xl font-semibold">Items ({filteredItems().length})</h2>
          </div>
          
          <Show when={filteredItems().length > 0} fallback={
            <div class="p-8 text-center text-gray-400">
              <div class="text-4xl mb-4">📝</div>
              <p>No items found. Try adjusting your filters or add some items!</p>
            </div>
          }>
            <div class="divide-y divide-slate-700">
              <For each={filteredItems()}>
                {(item) => (
                  <div class="p-6 hover:bg-slate-750 transition-colors">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => handleToggleCompletion(item.id)}
                            class={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {item.completed && '✓'}
                          </button>
                          <h3 class={`text-lg font-semibold ${item.completed ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                          </h3>
                          <span class={`text-sm ${getPriorityColor(item.priority)}`}>
                            {getPriorityIcon(item.priority)} {item.priority}
                          </span>
                        </div>
                        
                        <Show when={item.description}>
                          <p class="text-gray-400 mb-2">{item.description}</p>
                        </Show>
                        
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                          <span class="flex items-center gap-1">
                            🏷️ {getCategoryName(item.category)}
                          </span>
                          <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>🔄 {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div class="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
        
        {/* Categories List */}
        <div class="bg-slate-800 rounded-lg overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-700">
            <h2 class="text-2xl font-semibold">Categories ({categories().length})</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            <For each={categories()()}>
              {(category: LocalStorageCategory) => (
                <div class="bg-slate-750 p-4 rounded-lg border border-slate-700">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div 
                        class="w-4 h-4 rounded-full" 
                        style={{ 'background-color': category.color }}
                      ></div>
                      <h3 class="font-semibold">{category.name}</h3>
                    </div>
                    <span class="text-sm text-gray-400">{category.itemCount} items</span>
                  </div>
                  
                  <div class="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      class="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      class="flex-1 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
        
        {/* Add Item Modal */}
        <Show when={showAddItem()}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 class="text-xl font-semibold mb-4">Add New Item</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={newItem().name}
                    onInput={(e) => setNewItem({ ...newItem(), name: e.currentTarget.value })}
                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    placeholder="Item name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newItem().description}
                    onInput={(e) => setNewItem({ ...newItem(), description: e.currentTarget.value })}
                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    placeholder="Item description"
                    rows={3}
                  />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={newItem().category}
                      onChange={(e) => setNewItem({ ...newItem(), category: e.currentTarget.value })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="">Select Category</option>
                      <For each={categories()()}>
                        {(category: LocalStorageCategory) => (
                          <option value={category.id}>{category.name}</option>
                        )}
                      </For>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={newItem().priority}
                      onChange={(e) => setNewItem({ ...newItem(), priority: e.currentTarget.value as any })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={newItem().completed}
                    onChange={(e) => setNewItem({ ...newItem(), completed: e.currentTarget.checked })}
                    class="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                  />
                  <label for="completed" class="text-sm">Mark as completed</label>
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button
                  onClick={handleAddItem}
                  disabled={!newItem().name || !newItem().category}
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Show>
        
        {/* Add Category Modal */}
        <Show when={showAddCategory()}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 class="text-xl font-semibold mb-4">Add New Category</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={newCategory().name}
                    onInput={(e) => setNewCategory({ ...newCategory(), name: e.currentTarget.value })}
                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    placeholder="Category name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2">Color</label>
                  <input
                    type="color"
                    value={newCategory().color}
                    onChange={(e) => setNewCategory({ ...newCategory(), color: e.currentTarget.value })}
                    class="w-full h-12 bg-slate-700 border border-slate-600 rounded-md"
                  />
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory().name}
                  class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  Add Category
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Show>
        
        {/* Edit Item Modal */}
        <Show when={editingItem()}>
          {(item) => (
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Edit Item</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={item().name}
                      onInput={(e) => setEditingItem({ ...item(), name: e.currentTarget.value })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={item().description || ''}
                      onInput={(e) => setEditingItem({ ...item(), description: e.currentTarget.value })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={item().category}
                        onChange={(e) => setEditingItem({ ...item(), category: e.currentTarget.value })}
                        class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <For each={categories()()}>
                          {(category) => (
                            <option value={category.id}>{category.name}</option>
                          )}
                        </For>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={item().priority}
                        onChange={(e) => setEditingItem({ ...item(), priority: e.currentTarget.value as any })}
                        class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-completed"
                      checked={item().completed}
                      onChange={(e) => setEditingItem({ ...item(), completed: e.currentTarget.checked })}
                      class="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                    />
                    <label for="edit-completed" class="text-sm">Mark as completed</label>
                  </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                  <button
                    onClick={() => handleUpdateItem(item().id, editingItem()!)}
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                  >
                    Update Item
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>
        
        {/* Edit Category Modal */}
        <Show when={editingCategory()}>
          {(category) => (
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-4">Edit Category</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={category().name}
                      onInput={(e) => setEditingCategory({ ...category(), name: e.currentTarget.value })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      value={category().color}
                      onChange={(e) => setEditingCategory({ ...category(), color: e.currentTarget.value })}
                      class="w-full h-12 bg-slate-700 border border-slate-600 rounded-md"
                    />
                  </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                  <button
                    onClick={() => handleUpdateCategory(category().id, editingCategory()!)}
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                  >
                    Update Category
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>
        
        {/* Footer Info */}
        <div class="text-center text-gray-400 text-sm mt-12">
          <p>This demo showcases TanStack DB with LocalStorage persistence and real-time updates</p>
          <p class="mt-2">Data is stored in your browser's localStorage and persists between sessions</p>
        </div>
      </div>
    </div>
  )
}
