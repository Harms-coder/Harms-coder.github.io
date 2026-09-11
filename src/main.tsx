import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { seedDefaultExercisesIfNeeded } from './db/exerciseSeed'
import { seedDefaultQuotesIfNeeded } from './db/quotes'
import './index.css'

async function bootstrap() {
  await seedDefaultExercisesIfNeeded()
  await seedDefaultQuotesIfNeeded()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void bootstrap()
