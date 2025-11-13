import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Auth from './components/auth/Auth'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'
import { setUserEmail, clearUser } from './store/store.js'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Check authentication status on app load
  useEffect(() => {
    const user = localStorage.getItem('user')
    
    if (user) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleAuthSuccess = ({ email, isNew }) => {
    setIsAuthenticated(true)
    // Initialize per-user keys
    const gemsKey = `gems:${email}`
    const petKey = `pet:${email}`

    // Initialize gems: 20 for new users, keep existing otherwise
    const existingGems = localStorage.getItem(gemsKey)
    if (isNew || existingGems === null) {
      localStorage.setItem(gemsKey, JSON.stringify(20))
    }

    // Initialize pet state if new or missing
    const existingPet = localStorage.getItem(petKey)
    if (isNew || existingPet === null) {
      const defaultPet = {
        id: 'cat',
        name: 'Whiskers',
        type: 'cat',
        life: 100,
        isAlive: true,
        lastUpdated: Date.now()
      }
      localStorage.setItem(petKey, JSON.stringify(defaultPet))
    }

    // Wire user email into Redux for per-user persistence
    dispatch(setUserEmail(email))

    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    // Clear user from Redux
    dispatch(clearUser())
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-pet">🐾</div>
          <h2>Loading PetTalk...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        {/* Authentication Route */}
        <Route 
          path="/auth" 
          element={
            !isAuthenticated ? (
              <Auth onAuthSuccess={handleAuthSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={
            <Navigate to={
              isAuthenticated ? "/dashboard" : "/auth"
            } replace />
          } 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
