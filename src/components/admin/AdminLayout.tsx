import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  LayoutGrid,
  Film,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  ChevronDown,
} from 'lucide-react';

type Categoria = { id: string; nome: string; slug: string };

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [workOpen, setWorkOpen] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Buscar categorias do banco para o submenu
  useEffect(() => {
    supabase
      .from('categorias')
      .select('id, nome, slug')
      .order('ordem')
      .order('nome')
      .then(({ data }) => setCategorias(data || []));
  }, [location.pathname]); // re-busca ao navegar (caso o usuário crie uma nova categoria)

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/5 bg-black transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
        style={{ flexShrink: 0 }}
      >
        {/* Logo */}
        <div className={`h-[64px] flex items-center px-5 border-b border-white/5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-white font-black text-lg uppercase tracking-tighter">
              DUDA<span className="text-[#00FF88]">.</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              location.pathname === '/admin'
                ? 'bg-[#00FF88]/10 text-[#00FF88]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Dashboard' : undefined}
          >
            <LayoutGrid size={18} />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {/* Trabalhos (com submenu de categorias dinâmicas) */}
          <div>
            <button
              onClick={() => { if (!collapsed) setWorkOpen(!workOpen); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive('/admin/trabalhos')
                  ? 'bg-[#00FF88]/10 text-[#00FF88]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Trabalhos' : undefined}
            >
              <Film size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Trabalhos</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${workOpen ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {/* Submenu categorias dinâmicas */}
            {!collapsed && workOpen && (
              <div className="mt-1 ml-4 space-y-0.5 border-l border-white/5 pl-3">
                <Link
                  to="/admin/trabalhos"
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all ${
                    location.pathname === '/admin/trabalhos' && !location.search
                      ? 'text-[#00FF88]'
                      : 'text-white/30 hover:text-white/70'
                  }`}
                >
                  Todos
                </Link>
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/admin/trabalhos?categoria=${cat.slug}`}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all ${
                      location.search === `?categoria=${cat.slug}`
                        ? 'text-[#00FF88]'
                        : 'text-white/30 hover:text-white/70'
                    }`}
                  >
                    {cat.nome}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Categorias */}
          <Link
            to="/admin/categorias"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              isActive('/admin/categorias')
                ? 'bg-[#00FF88]/10 text-[#00FF88]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Categorias' : undefined}
          >
            <Tag size={18} />
            {!collapsed && <span>Categorias</span>}
          </Link>
        </nav>

        {/* Footer do sidebar (usuário + logout) */}
        <div className={`p-3 border-t border-white/5 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white/60 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Sair"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Topbar */}
        <header className="h-[64px] border-b border-white/5 bg-black/50 backdrop-blur-sm flex items-center justify-end px-8 gap-4 sticky top-0 z-10">
          <Link
            to="/admin/trabalhos/novo"
            className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#00FF88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
          >
            <Plus size={16} />
            Novo Trabalho
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
