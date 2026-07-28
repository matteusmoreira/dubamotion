import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';

const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const TrabalhosPage = lazy(() => import('./pages/admin/TrabalhosPage'));
const EditarTrabalhoPage = lazy(() => import('./pages/admin/EditarTrabalhoPage'));
const CategoriasPage = lazy(() => import('./pages/admin/CategoriasPage'));
const LogosPage = lazy(() => import('./pages/admin/LogosPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute').then((module) => ({
  default: module.ProtectedRoute,
})));

// ScrollToTop component to handle scroll reset on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AdminAuthBoundary() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black" role="status" aria-label="Carregando">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00FF88] border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Site público */}
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />

          <Route element={<AdminAuthBoundary />}>
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
            {/* Admin - logotipos */}
            <Route
              path="/admin/logos"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <LogosPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
