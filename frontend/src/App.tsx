import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- LAYOUTS ---
import DashboardLayout from './components/DashboardLayout';

// --- PAGES ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // අලුතින් හදපු Register Page එක
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import UsersPage from './pages/UsersPage';

/**
 * Main Application Component
 * --------------------------
 * Handles global routing and ensures data isolation 
 * by protecting private routes.
 */
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- PUBLIC ROUTES --- */}
        {/* ලොග් වෙලා නැති අයට විතරයි මේවා පේන්නේ. 
            යූසර් ලොග් වෙලා ඉන්නවා නම් කෙලින්ම Dashboard (/) එකට යවනවා. */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} 
        />

        {/* --- PROTECTED ROUTES (Dashboard Area) --- */}
        {/* මේ පාරවල් වැඩ කරන්නේ යූසර් සාර්ථකව ලොගින් වුණොත් විතරයි. 
            නැත්නම් එයාව කෙලින්ම /login එකට පන්නනවා. */}

        {/* 1. Home / Executive Dashboard */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* 2. Asset Management */}
        <Route 
          path="/assets" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <AssetsPage />
              </DashboardLayout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* 3. Work Orders Management */}
        <Route 
          path="/work-orders" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <WorkOrdersPage />
              </DashboardLayout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* 4. Team Management (Users) */}
        <Route 
          path="/users" 
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            ) : <Navigate to="/login" replace />
          } 
        />

        {/* --- FALLBACK ROUTE --- */}
        {/* පද්ධතියේ නැති වැරදි URL එකක් ගැහුවොත් ඔටෝම Home එකට යවයි */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;