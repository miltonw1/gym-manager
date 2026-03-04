import { Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from './components/auth/ProtectedRoute';

const Dashboard = () => (
  <div className="flex min-h-svh flex-col items-center justify-center">
    <h1 className="text-2xl font-bold">Dashboard (Protected)</h1>
    <p>Welcome to your gym manager.</p>
  </div>
);

const Login = () => (
  <div className="flex min-h-svh flex-col items-center justify-center">
    <h1 className="text-2xl font-bold">Login Page</h1>
    <p>Please log in to continue.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
