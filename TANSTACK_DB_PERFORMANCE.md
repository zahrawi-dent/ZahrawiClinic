# TanStack DB Performance Guide

## 🚨 **Performance Issues with "Listen to All" Approach**

The original implementation that listened to all records at once had several performance problems:

### **Problems:**
1. **Memory Usage** - Loading entire collections into memory
2. **Network Overhead** - Fetching all data on every page load
3. **Real-time Overhead** - Subscribing to all changes across all collections
4. **UI Performance** - Rendering large lists causes lag
5. **Unnecessary Data** - Loading data you don't need

### **Example of Bad Performance:**
```typescript
// ❌ BAD: Listening to everything
export function useRealTimeSync() {
  createEffect(() => {
    const cleanup = setupRealTimeSync() // Subscribes to ALL collections
    onCleanup(cleanup)
  })
}

// ❌ BAD: Loading all data
const patientsQuery = usePatients() // Loads ALL patients
const appointmentsQuery = useAppointments() // Loads ALL appointments
```

## ✅ **Better Performance Approaches**

### **1. Collection-Specific Sync**

Only subscribe to collections you actually use:

```typescript
// ✅ GOOD: Only sync what you need
export function TanStackDBExample() {
  // Only sync collections that are actually being used
  useCollectionSync(Collections.Patients)
  useCollectionSync(Collections.Appointments)
  useCollectionSync(Collections.Clinics)
  
  // Use only the collections we need
  const patientsQuery = usePatients()
  const appointmentsQuery = useAppointments()
  const clinicsQuery = useClinics()
}
```

### **2. Record-Specific Sync**

For detail pages, only sync the specific record:

```typescript
// ✅ GOOD: Only sync the record you're viewing
export function PatientDetailPage({ patientId }: { patientId: string }) {
  useRecordSync(Collections.Patients, () => patientId)
  
  const patientQuery = usePatient(() => patientId)
  
  return (
    <div>
      <h1>{patientQuery.data?.first_name} {patientQuery.data?.last_name}</h1>
      {/* Only this patient gets real-time updates */}
    </div>
  )
}
```

### **3. Conditional Sync**

Only sync when there are active queries:

```typescript
// ✅ GOOD: Conditional sync based on active queries
export function useConditionalCollectionSync(collectionName: Collections) {
  const queryClient = useQueryClient()
  
  createEffect(() => {
    // Check if there are active queries for this collection
    const hasActiveQueries = queryClient.getQueryCache().find({
      queryKey: [collectionName],
      predicate: (query) => query.state.status === 'success'
    })
    
    if (hasActiveQueries) {
      const cleanup = setupCollectionSync(collectionName)
      onCleanup(cleanup)
    }
  })
}
```

### **4. Pagination and Filtering**

Load only what you need:

```typescript
// ✅ GOOD: Paginated data loading
export function usePatientsPaginated(page: () => number, limit: () => number = 20) {
  return useLiveQuery(
    (q) => q.from({ patients: collections.patients })
      .limit(limit())
      .offset((page() - 1) * limit()),
    [page, limit]
  )
}

// ✅ GOOD: Filtered data loading
export function usePatientsByClinic(clinicId: () => string) {
  return useLiveQuery(
    (q) => q.from({ patients: collections.patients })
      .where(({ patients }) => patients.primary_clinic.includes(clinicId())),
    [clinicId]
  )
}
```

## 🎯 **Performance Best Practices**

### **1. Use Targeted Sync Hooks**

```typescript
// ✅ Use these instead of the legacy approach
import { useCollectionSync, useRecordSync } from '../lib/useTanStackDB'

// For list pages
useCollectionSync(Collections.Patients)

// For detail pages
useRecordSync(Collections.Patients, () => patientId)
```

### **2. Load Only Required Data**

```typescript
// ❌ BAD: Loading everything
const allPatients = usePatients() // Could be thousands of records

// ✅ GOOD: Load only what you need
const recentPatients = useRecentPatients(10) // Only 10 records
const patientsByClinic = usePatientsByClinic(clinicId) // Only relevant patients
```

### **3. Implement Proper Cleanup**

```typescript
// ✅ GOOD: Proper cleanup in components
export function PatientList() {
  useCollectionSync(Collections.Patients)
  
  // Component automatically cleans up subscription when unmounted
  return <div>...</div>
}
```

### **4. Use Debounced Search**

```typescript
// ✅ GOOD: Debounced search to reduce API calls
export function useSearchPatients(searchTerm: () => string) {
  const debouncedTerm = createMemo(() => {
    // Implement debouncing logic here
    return searchTerm()
  })
  
  return useLiveQuery(
    (q) => q.from({ patients: collections.patients })
      .where(({ patients }) => 
        patients.first_name.toLowerCase().includes(debouncedTerm().toLowerCase())
      ),
    [debouncedTerm]
  )
}
```

## 📊 **Performance Comparison**

| Approach | Memory Usage | Network Calls | Real-time Overhead | Scalability |
|----------|-------------|---------------|-------------------|-------------|
| **Listen to All** | High | High | High | Poor |
| **Collection-Specific** | Medium | Medium | Medium | Good |
| **Record-Specific** | Low | Low | Low | Excellent |
| **Conditional** | Low | Low | Low | Excellent |

## 🔧 **Migration Guide**

### **From Legacy to Performant:**

1. **Replace global sync:**
```typescript
// ❌ OLD
useRealTimeSync()

// ✅ NEW
useCollectionSync(Collections.Patients)
useCollectionSync(Collections.Appointments)
```

2. **Add record-specific sync for detail pages:**
```typescript
// ✅ NEW: Add this to detail pages
useRecordSync(Collections.Patients, () => patientId)
```

3. **Remove unused collection hooks:**
```typescript
// ❌ OLD: Loading everything
const allCollections = useAllCollections()

// ✅ NEW: Load only what you need
const patients = usePatients()
const appointments = useAppointments()
```

## 🚀 **Advanced Performance Tips**

### **1. Lazy Loading**

```typescript
// ✅ GOOD: Lazy load collections
const [showAppointments, setShowAppointments] = createSignal(false)

createEffect(() => {
  if (showAppointments()) {
    useCollectionSync(Collections.Appointments)
  }
})
```

### **2. Virtual Scrolling for Large Lists**

```typescript
// ✅ GOOD: Use virtual scrolling for large datasets
import { createVirtualizer } from '@tanstack/solid-virtual'

export function VirtualPatientList() {
  const patientsQuery = usePatients()
  
  const virtualizer = createVirtualizer({
    count: patientsQuery.data?.length || 0,
    getScrollElement: () => scrollElementRef,
    estimateSize: () => 50,
  })
  
  return (
    <div ref={scrollElementRef}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <For each={virtualizer.getVirtualItems()}>
          {(virtualItem) => (
            <div style={{ height: `${virtualItem.size}px` }}>
              {patientsQuery.data?.[virtualItem.index]?.first_name}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
```

### **3. Optimistic Updates**

```typescript
// ✅ GOOD: Optimistic updates for better UX
const updatePatient = async (patientId: string, data: any) => {
  // Optimistically update the UI
  collections.patients.update(patientId, (draft) => {
    Object.assign(draft, data)
  })
  
  try {
    // Then sync with server
    await pb.collection('patients').update(patientId, data)
  } catch (error) {
    // Rollback on error
    console.error('Update failed:', error)
  }
}
```

## 📈 **Monitoring Performance**

### **1. Track Subscription Count**

```typescript
// ✅ GOOD: Monitor active subscriptions
export function useSubscriptionMonitor() {
  const [activeSubscriptions, setActiveSubscriptions] = createSignal(0)
  
  // Track subscription count
  createEffect(() => {
    console.log(`Active subscriptions: ${activeSubscriptions()}`)
  })
  
  return { activeSubscriptions }
}
```

### **2. Memory Usage Monitoring**

```typescript
// ✅ GOOD: Monitor memory usage
export function useMemoryMonitor() {
  createEffect(() => {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      })
    }
  })
}
```

## 🎯 **Summary**

The key to good performance with TanStack DB and PocketBase is:

1. **Only sync what you need** - Use `useCollectionSync()` and `useRecordSync()`
2. **Load only required data** - Implement pagination and filtering
3. **Proper cleanup** - Let components handle their own subscriptions
4. **Monitor performance** - Track memory usage and subscription count
5. **Use optimistic updates** - For better user experience

This approach scales much better and provides a much better user experience, especially as your data grows.
