import { useState, useEffect } from 'react'
import { X, Share2 } from 'lucide-react'

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      const isStandalone = (window.navigator as any).standalone

      setIsIOS(isIOSDevice)

      // Show prompt if it's iOS Safari and not already installed
      if (isIOSDevice && isSafari && !isStandalone) {
        const hasDismissed = localStorage.getItem('installPromptDismissed')
        const installDate = localStorage.getItem('installPromptDate')
        const daysSinceInstall = installDate ? (Date.now() - parseInt(installDate)) / (1000 * 60 * 60 * 24) : 0
        
        if (!hasDismissed && daysSinceInstall > 7) {
          setTimeout(() => setShowPrompt(true), 3000)
        }
      }
    }

    // Handle beforeinstallprompt for non-iOS devices
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after some interaction
      const hasDismissed = localStorage.getItem('installPromptDismissed')
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    checkDevice()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
    localStorage.setItem('installPromptDate', Date.now().toString())
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('installPromptDismissed', 'true')
      }
      setDeferredPrompt(null)
    }
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  const renderIOSInstructions = () => (
    <div className="flex-1">
      <h3 className="text-lg font-semibold">Install GAME.ON</h3>
      <p className="mt-2 text-sm text-gray-300">
        Install this app on your iPhone for a better experience.
      </p>
      <ol className="mt-3 space-y-2 text-sm text-gray-300">
        <li className="flex items-center">
          <Share2 className="mr-2 h-4 w-4" />
          Tap the share button in Safari
        </li>
        <li className="flex items-center">
          <span className="mr-2">2.</span>
          Scroll down and tap "Add to Home Screen"
        </li>
        <li className="flex items-center">
          <span className="mr-2">3.</span>
          Tap "Add" in the top right corner
        </li>
      </ol>
    </div>
  )

  const renderAndroidInstructions = () => (
    <div className="flex-1">
      <h3 className="text-lg font-semibold">Install GAME.ON</h3>
      <p className="mt-2 text-sm text-gray-300">
        Install this app for a better experience.
      </p>
    </div>
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-sm rounded-lg bg-black/90 p-4 text-white shadow-xl">
        <div className="flex items-start justify-between">
          {isIOS ? renderIOSInstructions() : renderAndroidInstructions()}
          <button
            onClick={handleDismiss}
            className="ml-4 rounded-full p-1 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
