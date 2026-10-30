import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GlobeView from './pages/Globe';
import Conjunctions from './pages/Conjunctions';
import Mitigation from './pages/Mitigation';
import Alerts from './pages/Alerts';
import Login from './pages/Login';

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;
  if (!user) return null;
  return element;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="relative z-0">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    ),
    children: [
      { index: element: <Dashboard /> },
      { path: 'login', element: <Login /> },
      {
        path: 'globe',
        element: (
          <ProtectedRoute element={<GlobeView />} />
        )
      },
      {
        path: 'conjunctions',
        element: (
          <ProtectedRoute element={<Conjunctions />} />
        )
      },
      {
        path: 'mitigation',
        element: (
          <ProtectedRoute element={<Mitigation />} />
        )
      },
      {
        path: 'alerts',
        element: (
          <ProtectedRoute element={<Alerts />} />
        )
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  }
]);

export default AppRoutes;
