import { Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ExpiringMembersPage from './pages/ExpiringMembersPage';
import ExpiredMembersPage from './pages/ExpiredMembersPage';
import PlansPage from './pages/PlansPage';
import BillingPage from './pages/BillingPage';
import BillingResultPage from './pages/BillingResultPage';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/billing/result' element={<BillingResultPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to='/dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='dashboard/expiring-members' element={<ExpiringMembersPage />} />
          <Route path='dashboard/expired-members' element={<ExpiredMembersPage />} />
          <Route path='plans' element={<PlansPage />} />
          <Route path='billing' element={<BillingPage />} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}

export default App;
