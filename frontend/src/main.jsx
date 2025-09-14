import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AccountsPage from './AccountsPage.jsx'
import App from './App.jsx'
import TransactionsPage from "./pages/TransactionsPage.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<AccountsPage />} />
              <Route path="/accounts/:id" element={<TransactionsPage />} />
          </Routes>                 
      </BrowserRouter>
  </StrictMode>,
)
