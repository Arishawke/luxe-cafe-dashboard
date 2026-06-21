import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { handleMigrationSend } from './lib/migration'

// On the old origin this redirects with the data payload; skip rendering then.
if (!handleMigrationSend()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>,
  )
}
