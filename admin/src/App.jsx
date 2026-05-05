import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestBuilder from './pages/TestBuilder';
import TestEdit from './pages/TestEdit';
import AttemptReview from './pages/AttemptReview';
import GradeAttempt from './pages/GradeAttempt';
import Users from './pages/Users';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      {user && <Sidebar />}
      <div className={user ? 'flex-1 ml-64' : 'flex-1'}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tests" element={<PrivateRoute><TestBuilder /></PrivateRoute>} />
          <Route path="/tests/:id" element={<PrivateRoute><TestEdit /></PrivateRoute>} />
          <Route path="/attempts" element={<PrivateRoute><AttemptReview /></PrivateRoute>} />
          <Route path="/attempts/:id/grade" element={<PrivateRoute><GradeAttempt /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
