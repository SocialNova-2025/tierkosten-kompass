import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { LanguageProvider } from './lib/LanguageContext'

// Android hardware back button — minimize app if no history, else go back
const cap = (window as unknown as { Capacitor?: { isNativePlatform(): boolean } }).Capacitor
if (cap?.isNativePlatform?.()) {
  import('@capacitor/app')
    .then(({ App: CapApp }) => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        } else {
          void CapApp.minimizeApp()
        }
      })
    })
    .catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
