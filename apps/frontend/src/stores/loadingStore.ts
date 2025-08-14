import { createSignal } from 'solid-js'

const [isLoading, setIsLoading] = createSignal(false)
const [loadingMessage, setLoadingMessage] = createSignal('')

export const useLoadingStore = () => {
  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('')
  }

  return {
    isLoading: isLoading,
    loadingMessage: loadingMessage,
    startLoading,
    stopLoading
  }
}
