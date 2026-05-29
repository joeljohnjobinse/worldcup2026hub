import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Predict from './pages/Predict'
import Leaderboard from './pages/Leaderboard'
import Tickets from './pages/Tickets'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-wc-dark">
          <Navbar />
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/schedule"   element={<Schedule />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/predict"    element={<ProtectedRoute><Predict /></ProtectedRoute>} />
            <Route path="/tickets"    element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin"      element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}