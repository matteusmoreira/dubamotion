import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Trabalho } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export default function TrabalhosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoriaFiltro = searchParams.get('categoria');

  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [categories, setCategories] = useState<{ id: string | null; label: string }[]>([
    { id: null, label: 'Todos' }
  ]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCategorias = async () => {
    const { data } = await supabase.from('categorias').select('nome, slug').order('ordem');
    if (data) {
      setCategories([
        { id: null, label: 'Todos' },
        ...data.map((c) => ({ id: c.slug, label: c.nome }))
      ]);
    }
  };

  const fetchTrabalhos = async () => {
    setLoading(true);
    let query = supabase.from('trabalhos').select('*').order('ordem').order('created_at', { ascending: false });
    if (categoriaFiltro) query = query.eq('categoria', categoriaFiltro);
    const { data } = await query;
    setTrabalhos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => { 
    fetchTrabalhos(); 
  }, [categoriaFiltro]);

  const togglePublicado = async (trabalho: Trabalho) => {
    await supabase
      .from('trabalhos')
      .update({ publicado: !trabalho.publicado })
      .eq('id', trabalho.id);
    fetchTrabalhos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este trabalho? Esta ação não pode ser desfeita.')) return;
    setDeleting(id);
    await supabase.from('trabalhos').delete().eq('id', id);
    fetchTrabalhos();
    setDeleting(null);
  };

  const catAtual = categories.find((c) => c.id === categoriaFiltro);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {catAtual?.label || 'Todos os Trabalhos'}
          </h1>
          <p className="text-white/40 text-sm">{trabalhos.length} trabalho{trabalhos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/admin/trabalhos/novo"
          className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#00FF88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
        >
          <Plus size={16} /> Novo Trabalho
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => navigate(cat.id ? `/admin/trabalhos?categoria=${cat.id}` : '/admin/trabalhos')}
            className={`px-4 py-2 rounded-full text-sm border transition-all ${
              categoriaFiltro === cat.id
                ? 'bg-[#00FF88] border-[#00FF88] text-black font-semibold'
                : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trabalhos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center gap-4">
          <p className="text-white/30">Nenhum trabalho nesta categoria ainda.</p>
          <Link
            to="/admin/trabalhos/novo"
            className="flex items-center gap-2 text-[#00FF88] text-sm border border-[#00FF88]/30 px-4 py-2 rounded-xl hover:bg-[#00FF88]/10 transition-all"
          >
            <Plus size={14} /> Criar o primeiro
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {trabalhos.map((trabalho) => (
            <div
              key={trabalho.id}
              className={`group relative bg-white/[0.03] border rounded-2xl overflow-hidden transition-all hover:border-white/20 ${
                trabalho.publicado ? 'border-white/8' : 'border-dashed border-white/5 opacity-60'
              }`}
            >
              {/* Imagem de capa */}
              <div className="aspect-[3/4] relative bg-white/5">
                {trabalho.capa_url ? (
                  <img
                    src={trabalho.capa_url}
                    alt={trabalho.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    Sem capa
                  </div>
                )}
                {/* Badge status */}
                <span
                  className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    trabalho.publicado
                      ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {trabalho.publicado ? 'Publicado' : 'Rascunho'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm truncate mb-1">{trabalho.titulo}</h3>
                <p className="text-white/30 text-xs capitalize">{trabalho.categoria}</p>
              </div>

              {/* Actions */}
              <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={() => togglePublicado(trabalho)}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
                  title={trabalho.publicado ? 'Despublicar' : 'Publicar'}
                >
                  {trabalho.publicado ? <EyeOff size={12} /> : <Eye size={12} />}
                  {trabalho.publicado ? 'Ocultar' : 'Publicar'}
                </button>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/trabalhos/${trabalho.id}`}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-all"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </Link>
                  <button
                    onClick={() => handleDelete(trabalho.id)}
                    disabled={deleting === trabalho.id}
                    className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400/60 hover:text-red-400 transition-all disabled:opacity-50"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
