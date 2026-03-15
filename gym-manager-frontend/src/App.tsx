import { Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpiringMembersPage from './pages/ExpiringMembersPage';
import ExpiredMembersPage from './pages/ExpiredMembersPage';
import PlansPage from './pages/PlansPage';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to='/dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='dashboard/expiring-members' element={<ExpiringMembersPage />} />
          <Route path='dashboard/expired-members' element={<ExpiredMembersPage />} />
          <Route path='plans' element={<PlansPage />} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}

export default App;
