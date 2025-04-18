import { useNavigate } from '@tanstack/solid-router'
import { JSX } from 'solid-js'

function BackButton(props: { to?: string, class?: string, label?: string }): JSX.Element {
  const navigate = useNavigate()

  const goBack = (): void => {
    if (props.to) {
      // Navigate to specific route if provided
      navigate({ to: props.to, replace: true }).catch(() => { })
    } else {
      // Go back in history
      // navigate({ to: -1, replace: true }).catch(() => { })
    }
  }

  return (
    <button
      onClick={goBack}
      class={`flex items-center text-gray-700 hover:text-blue-600 ${props.class || ''}`}
      type="button"
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{props.label || 'Back'}</span>
    </button>
  )
}

export default BackButton
