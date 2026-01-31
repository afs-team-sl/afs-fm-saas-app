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
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SettingsPage from './pages/SettingsPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import InventoryPage from './pages/InventoryPage';
import MaintenancePlansPage from './pages/MaintenancePlansPage';
import LocationsPage from './pages/LocationsPage';

function App() {
  const { isAuthenticated, role } = useAuth();

  // Role Checks
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontWeight: 'bold' } }} />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />

          {/* Main Dashboard - Role Aware */}
          <Route path="/" element={
            isAuthenticated ? (
              isSuperAdmin ? (
                <DashboardLayout><SuperAdminDashboard /></DashboardLayout>
              ) : (
                <DashboardLayout><DashboardPage /></DashboardLayout>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Regular Tenant Routes - Hidden from Super Admin */}
          <Route path="/assets" element={
            isAuthenticated ? (!isSuperAdmin ? <DashboardLayout><AssetsPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/work-orders" element={
            isAuthenticated ? (!isSuperAdmin ? <DashboardLayout><WorkOrdersPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/work-orders/:id" element={
            isAuthenticated ? (!isSuperAdmin ? <DashboardLayout><WorkOrderDetailsPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/inventory" element={
            isAuthenticated ? (!isSuperAdmin ? <DashboardLayout><InventoryPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          
          {/* Admin/Manager Routes - Hidden from Super Admin */}
          <Route path="/maintenance" element={
            isAuthenticated ? ((isAdmin || isManager) && !isSuperAdmin ? <DashboardLayout><MaintenancePlansPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          <Route path="/locations" element={
            isAuthenticated ? ((isAdmin || isManager) && !isSuperAdmin ? <DashboardLayout><LocationsPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          
          {/* Users Route - Role Aware (Super Admin sees global, Admin sees tenant) */}
          <Route path="/users" element={
            isAuthenticated ? ((isAdmin || isSuperAdmin) ? <DashboardLayout><UsersPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />

          {/* Super Admin Tenant Management */}
          <Route path="/super-admin" element={
            isAuthenticated ? (isSuperAdmin ? <DashboardLayout><SuperAdminPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" replace />
          } />
          
          {/* Settings and Asset Details */}
          <Route path="/settings" element={isAuthenticated ? <DashboardLayout><SettingsPage /></DashboardLayout> : <Navigate to="/login" />} />
          <Route path="/assets/:id" element={
            isAuthenticated ? (!isSuperAdmin ? <DashboardLayout><AssetDetailsPage /></DashboardLayout> : <Navigate to="/" replace />) : <Navigate to="/login" />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;