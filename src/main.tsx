import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { seedDefaultExercisesIfNeeded } from './db/exerciseSeed'
import { seedDefaultQuotesIfNeeded } from './db/quotes'
import { startLeafBadges } from './lib/leafBadges'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Henter nye versioner i baggrunden og tager dem i brug ved næste åbning.
registerSW({ immediate: true })

async function bootstrap() {
  await seedDefaultExercisesIfNeeded()
  await seedDefaultQuotesIfNeeded()

  const root = document.getElementById('root')!
  startLeafBadges(root)
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void bootstrap()
