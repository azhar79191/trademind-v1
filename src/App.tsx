import { Routes, Route } from 'react-router'
import Landing from './pages/Landing'
import Login from './pages/Login'
import GoogleCallback from './pages/GoogleCallback'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import Trading from './pages/Trading'
import TradeHistory from './pages/TradeHistory'
import Strategies from './pages/Strategies'
import Chat from './pages/Chat'
import News from './pages/News'
import Signals from './pages/Signals'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Charts from './pages/Charts'
import AdvancedCharts from './pages/AdvancedCharts'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/markets" element={<Markets />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/advanced-charts" element={<AdvancedCharts />} />
      <Route path="/trading/:pair?" element={<Trading />} />
      <Route path="/trades" element={<TradeHistory />} />
      <Route path="/strategies" element={<Strategies />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/news" element={<News />} />
      <Route path="/signals" element={<Signals />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
