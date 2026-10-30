import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GlobeView from './pages/Globe';
import Conjunctions from './pages/Conjunctions';
import Mitigation from './pages/Mitigation';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import LiveToastContainer from './components/LiveToastContainer';

function Layout() {
  return (
    <>
      <Navbar />
      <LiveToastContainer />
      <div className="min-h-screen pt-14">
        <Outlet />
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <RealtimeProvider>
          <Layout />
        </RealtimeProvider>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'login', element: <Login /> },
      { path: 'globe', element: <GlobeView /> },
      { path: 'conjunctions', element: <Conjunctions /> },
      { path: 'mitigation', element: <Mitigation /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
