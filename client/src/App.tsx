import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Worlds from './pages/Worlds'
import Settings from './pages/Settings'
import Profile from './pages/settings/Profile'
import Display from './pages/settings/Display'
import NotificationSettings from './pages/settings/NotificationSettings'
import Security from './pages/settings/Security'
import General from './pages/settings/General'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard>
              <Worlds />
            </Dashboard>
          </ProtectedRoute>
        } />
        <Route path="/worlds" element={
          <ProtectedRoute>
            <Dashboard>
              <Worlds />
            </Dashboard>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Dashboard>
              <Settings />
            </Dashboard>
          </ProtectedRoute>
        }>
          {/* Default redirect to profile */}
          <Route index element={<Navigate to="/settings/account/profile" replace />} />
          
          {/* Account section */}
          <Route path="account/profile" element={<Profile />} />
          <Route path="account/display" element={<Display />} />
          <Route path="account/notifications" element={<NotificationSettings />} />
          <Route path="account/security" element={<Security />} />
          
          {/* Household section */}
          <Route path="household/general" element={<General />} />
          <Route path="household/members" element={<div className="text-gray-600 dark:text-gray-400">Members settings coming soon...</div>} />
          <Route path="household/preferences" element={<div className="text-gray-600 dark:text-gray-400">Preferences settings coming soon...</div>} />
          <Route path="household/institutions" element={<div className="text-gray-600 dark:text-gray-400">Institutions settings coming soon...</div>} />
          <Route path="household/categories" element={<div className="text-gray-600 dark:text-gray-400">Categories settings coming soon...</div>} />
          <Route path="household/merchants" element={<div className="text-gray-600 dark:text-gray-400">Merchants settings coming soon...</div>} />
          <Route path="household/rules" element={<div className="text-gray-600 dark:text-gray-400">Rules settings coming soon...</div>} />
          <Route path="household/tags" element={<div className="text-gray-600 dark:text-gray-400">Tags settings coming soon...</div>} />
          <Route path="household/data" element={<div className="text-gray-600 dark:text-gray-400">Data settings coming soon...</div>} />
          <Route path="household/billing" element={<div className="text-gray-600 dark:text-gray-400">Billing settings coming soon...</div>} />
          <Route path="household/gift-monarch" element={<div className="text-gray-600 dark:text-gray-400">Gift Monarch settings coming soon...</div>} />
          <Route path="household/referrals" element={<div className="text-gray-600 dark:text-gray-400">Referrals settings coming soon...</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
