import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { TradingPairProvider } from "@/providers/TradingPairContext"
import { ThemeProvider } from "@/providers/ThemeContext"
import App from './App.tsx'

// Apply saved theme before first render to avoid flash
const savedTheme = localStorage.getItem("tm-theme") ?? "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <TradingPairProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TradingPairProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
