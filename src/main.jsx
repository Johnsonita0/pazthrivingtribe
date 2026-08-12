import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/global.css'
import './css/main-page.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={import.meta.env.BASE_URL}>
      <App />
    </Router>
  </StrictMode>,
)
