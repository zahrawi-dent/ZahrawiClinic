import { type Component, Show } from 'solid-js'
import { useLoading } from '../contexts/LoadingContext'
import LoadingSpinner from './LoadingSpinner'

const GlobalLoadingOverlay: Component = () => {
  const { isLoading, loadingMessage } = useLoading()

  return (
    <Show when={isLoading()}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-slate-800 rounded-lg p-6 flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p class="text-white text-sm">{loadingMessage()}</p>
        </div>
      </div>
    </Show>
  )
}

export default GlobalLoadingOverlay
