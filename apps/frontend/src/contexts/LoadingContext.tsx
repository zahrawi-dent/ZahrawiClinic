import type { Component } from 'solid-js'
import { createContext, useContext, createSignal } from 'solid-js'

interface LoadingContextType {
  isLoading: () => boolean
  setLoading: (loading: boolean) => void
  loadingMessage: () => string
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType>()

export const LoadingProvider: Component<{ children: any }> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [loadingMessage, setLoadingMessage] = createSignal('')

  const value: LoadingContextType = {
    isLoading,
    setLoading: setIsLoading,
    loadingMessage,
    setLoadingMessage
  }

  return (
    <LoadingContext.Provider value={value}>
      {props.children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
