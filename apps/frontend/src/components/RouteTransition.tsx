import type { Component } from 'solid-js'
import { Show, createSignal, onMount, onCleanup, createEffect } from 'solid-js'
import { useRouter } from '@tanstack/solid-router'
import RouteLoading from './RouteLoading'

interface RouteTransitionProps {
  children: any
}

const RouteTransition: Component<RouteTransitionProps> = (props) => {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = createSignal(false)
  const [showContent, setShowContent] = createSignal(true)
  const [isExiting, setIsExiting] = createSignal(false)

  onMount(() => {
    // Use a simpler approach with router state
    const unsubscribe = router.subscribe('onResolved', () => {
      setIsTransitioning(false)
      setShowContent(true)
      setIsExiting(false)
    })

    onCleanup(() => {
      unsubscribe()
    })
  })

  // Watch for loading state changes
  createEffect(() => {
    if (router.state.isLoading) {
      setIsExiting(true)
      setTimeout(() => {
        setIsTransitioning(true)
        setShowContent(false)
      }, 150)
    }
  })

  return (
    <div class="relative">
      <Show when={isTransitioning()} fallback={
        <div class={`transition-all duration-200 ease-in-out ${isExiting() ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {props.children}
        </div>
      }>
        <div class="transition-all duration-200 ease-in-out opacity-100 translate-y-0">
          <RouteLoading />
        </div>
      </Show>
    </div>
  )
}

export default RouteTransition
