import { type Component } from 'solid-js'
import LoadingSpinner from './LoadingSpinner'

const RouteLoading: Component = () => {
  return (
    <div class="flex items-center justify-center min-h-[400px] w-full">
      <div class="text-center">
        <LoadingSpinner size="lg" class="mb-4" />
        <p class="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default RouteLoading
