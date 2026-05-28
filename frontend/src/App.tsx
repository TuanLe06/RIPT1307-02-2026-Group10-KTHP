import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/layout/AdminLayout';
import DashboardOverview from './pages/admin/Dashboard';
import Universities from './pages/admin/Universities';
import Majors from './pages/admin/Majors';
import Combinations from './pages/admin/Combinations';
import Applications from './pages/admin/Applications';
import Profile from './pages/admin/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="universities" element={<Universities />} />
        <Route path="majors" element={<Majors />} />
        <Route path="combinations" element={<Combinations />} />
        <Route path="applications" element={<Applications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      {/* Keep old route for backward compatibility */}
      <Route
        path="/admin/old"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
