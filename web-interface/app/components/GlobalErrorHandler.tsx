'use client'

import { useEffect } from 'react'

// Helper function to suppress browser extension errors
const suppressExtensionErrors = (error: any) => {
  if (error && typeof error === 'object') {
    const message = error.message || error.toString()
    if (message.includes('bootstrap-autofill-overlay') || 
        message.includes('insertBefore') ||
        message.includes('NotFoundError') ||
        message.includes('Failed to execute')) {
      return true
    }
  }
  return false
}

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (suppressExtensionErrors(event.reason)) {
        console.log('Suppressed browser extension error (unhandled rejection):', event.reason)
        event.preventDefault()
        return
      }
    }

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      if (suppressExtensionErrors(event.error)) {
        console.log('Suppressed browser extension error (unhandled error):', event.error)
        event.preventDefault()
        return
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null // This component doesn't render anything
}
