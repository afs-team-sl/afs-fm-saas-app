import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import WorkOrderDetailsPage from './pages/WorkOrderDetailsPage';
import UsersPage from './pages/UsersPage';
import SuperAdminPage from './pages/SuperAdminPage';
import SettingsPage from './pages/SettingsPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import InventoryPage from './pages/InventoryPage';
import MaintenancePlansPage from './pages/MaintenancePlansPage';
import LocationsPage from './pages/LocationsPage';

function App() {
  const { isAuthenticated, role, tenantId } = useAuth();

  // Admin Check Function
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isSuperAdmin = isAdmin && String(tenantId || '').trim() === String(import.meta.env.VITE_SUPER_TENANT_ID || '').trim();

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
          <Route path="/work-orders/:id" element={isAuthenticated ? <DashboardLayout><WorkOrderDetailsPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          <Route path="/inventory" element={isAuthenticated ? <DashboardLayout><InventoryPage /></DashboardLayout> : <Navigate to="/login" replace />} />
          
          {/* Admin/Manager Routes */}
          <Route path="/maintenance" element={
            isAuthenticated ? ((isAdmin || isManager) ? <DashboardLayout><MaintenancePlansPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/locations" element={
            isAuthenticated ? ((isAdmin || isManager) ? <DashboardLayout><LocationsPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          
          {/* Admin-Only Routes */}
          <Route path="/users" element={
            isAuthenticated ? (isAdmin ? <DashboardLayout><UsersPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/super-admin" element={
            isAuthenticated ? (isSuperAdmin ? <DashboardLayout><SuperAdminPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          
          <Route path="/settings" element={isAuthenticated ? <DashboardLayout><SettingsPage /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/assets/:id" element={isAuthenticated ? <DashboardLayout><AssetDetailsPage /></DashboardLayout> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;