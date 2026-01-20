import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import UsersPage from './pages/UsersPage';
import SuperAdminPage from './pages/SuperAdminPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* පද්ධතියේ හැම තැනම පේන ලස්සන Notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontWeight: 'bold' } }} />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />

          {/* Protected Routes */}
          <Route path="/" element={isAuthenticated ? <DashboardLayout><DashboardPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          <Route path="/assets" element={isAuthenticated ? <DashboardLayout><AssetsPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          <Route path="/work-orders" element={isAuthenticated ? <DashboardLayout><WorkOrdersPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          <Route path="/users" element={isAuthenticated ? <DashboardLayout><UsersPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          <Route path="/super-admin" element={isAuthenticated ? <DashboardLayout><SuperAdminPage /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <DashboardLayout><SettingsPage /></DashboardLayout> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;