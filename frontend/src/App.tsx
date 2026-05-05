import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/motion/PageTransition';
import Register from './pages/Register';
import Login from './pages/Login';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import PoliciesPage from './pages/PoliciesPage';
import ManageServices from './pages/ManageServices';
import ManageExhibits from './pages/ManageExhibits';
import ManagerDashboard from './pages/ManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerAppointments from './pages/CustomerAppointments';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min default; landing page CMS queries override to 10 min
      retry: 1,
    },
  },
});

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/policies" element={<PageTransition><PoliciesPage /></PageTransition>} />
        <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'manager']}>
              <PageTransition><StaffDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <PageTransition><CustomerAppointments /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <PageTransition><Profile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-services"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <PageTransition><ManageServices /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <PageTransition><ManagerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-exhibits"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <PageTransition><ManageExhibits /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <AppRoutes />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
