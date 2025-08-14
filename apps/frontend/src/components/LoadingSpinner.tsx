import { type Component } from 'solid-js'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  class?: string
}

const LoadingSpinner: Component<LoadingSpinnerProps> = (props) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div class={`flex items-center justify-center ${props.class || ''}`}>
      <div
        class={`${sizeClasses[props.size || 'md']} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
        role="status"
        aria-label="Loading"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default LoadingSpinner
