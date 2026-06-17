import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import DeclarationList from '@/pages/DeclarationList'
import DeclarationNew from '@/pages/DeclarationNew'
import DeclarationDetail from '@/pages/DeclarationDetail'
import Documents from '@/pages/Documents'
import Tracking from '@/pages/Tracking'
import Archive from '@/pages/Archive'
import Statistics from '@/pages/Statistics'
import { useCustomsStore } from '@/store/useCustomsStore'

export default function App() {
  const init = useCustomsStore(s => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/declarations" element={<DeclarationList />} />
          <Route path="/declarations/new" element={<DeclarationNew />} />
          <Route path="/declarations/:id" element={<DeclarationDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  )
}
