import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      {/* Auth screens sit outside the app shell so they get no sidebar or player */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<AppLayout />} />
    </Routes>
  )
}

export default App
