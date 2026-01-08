import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationOTPPage from './pages/RegistrationOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PasswordResetOTPPage from './pages/PasswordResetOTPPage';
import PasswordResetNewPage from './pages/PasswordResetNewPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Auth.css'; // Import auth styles globallu

function App() {
  useEffect(() => {
    const handleOnline = () => toast.success('Back online! 🌐');
    const handleOffline = () => toast.warning('You are offline. Check your connection. 🔌');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="app-wrapper">
          <ToastContainer position="top-right" theme="dark" />
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-registration-otp" element={<RegistrationOTPPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-password-reset-otp" element={<PasswordResetOTPPage />} />
              <Route path="/reset-password-new" element={<PasswordResetNewPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
