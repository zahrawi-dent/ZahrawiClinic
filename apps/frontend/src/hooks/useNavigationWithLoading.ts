import { useNavigate } from '@tanstack/solid-router'
import { useLoading } from '../contexts/LoadingContext'

export const useNavigationWithLoading = () => {
  const navigate = useNavigate()
  const { setLoading, setLoadingMessage } = useLoading()

  const navigateWithLoading = async (to: string, options?: any) => {
    setLoadingMessage('Navigating...')
    setLoading(true)
    
    try {
      await navigate({ to, ...options })
    } finally {
      // Add a small delay to ensure the new route is fully loaded
      setTimeout(() => {
        setLoading(false)
      }, 100)
    }
  }

  return {
    navigate: navigateWithLoading,
    navigateWithoutLoading: navigate
  }
}
