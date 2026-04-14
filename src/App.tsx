import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import TrabalhosPage from './pages/admin/TrabalhosPage';
import EditarTrabalhoPage from './pages/admin/EditarTrabalhoPage';
import CategoriasPage from './pages/admin/CategoriasPage';
import AdminLayout from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// ScrollToTop component to handle scroll reset on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Site público */}
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />

          {/* Admin - login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin - painel protegido */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trabalhos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TrabalhosPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trabalhos/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EditarTrabalhoPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Admin - categorias */}
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CategoriasPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
