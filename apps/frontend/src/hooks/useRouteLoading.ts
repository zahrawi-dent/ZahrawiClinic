import { createSignal, onMount, onCleanup } from 'solid-js'
import { useRouter } from '@tanstack/solid-router'

export const useRouteLoading = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = createSignal(false)

  onMount(() => {
    const unsubscribe = router.subscribe('onResolved', () => {
      setIsLoading(false)
    })

    onCleanup(() => {
      unsubscribe()
    })
  })

  // Set loading when component mounts
  setIsLoading(true)

  return {
    isLoading
  }
}
