import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

// Instantly dismiss HTML splash upon React mount
try {
  const splash = document.getElementById('initial-splash');
  if (splash) {
    splash.style.transition = 'opacity 0.25s ease-out';
    splash.style.opacity = '0';
    setTimeout(() => {
      if (splash && splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 250);
  }
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
