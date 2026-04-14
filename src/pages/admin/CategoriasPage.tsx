import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X, GripVertical, Loader2 } from 'lucide-react';

type Categoria = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  descricao_en: string | null;
  ordem: number;
};

const emptyForm = { nome: '', slug: '', descricao: '', descricao_en: '' };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('ordem')
      .order('nome');
    setCategorias(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setForm({
      nome: cat.nome,
      slug: cat.slug,
      descricao: cat.descricao || '',
      descricao_en: cat.descricao_en || '',
    });
    setError('');
    setShowForm(true);
  };

  const handleNomeChange = (nome: string) => {
    setForm((f) => ({
      ...f,
      nome,
      // Auto-gerar slug apenas na criação
      ...(editingId ? {} : { slug: slugify(nome) }),
    }));
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return setError('O nome é obrigatório.');
    if (!form.slug.trim()) return setError('O slug é obrigatório.');
    setSaving(true);
    setError('');

    if (editingId) {
      const { error: err } = await supabase
        .from('categorias')
        .update({ nome: form.nome, slug: form.slug, descricao: form.descricao, descricao_en: form.descricao_en })
        .eq('id', editingId);
      if (err) setError(err.message === 'duplicate key value violates unique constraint "categorias_slug_key"'
        ? 'Esse slug já está em uso por outra categoria.'
        : err.message);
    } else {
      const maxOrdem = categorias.length ? Math.max(...categorias.map((c) => c.ordem)) + 1 : 1;
      const { error: err } = await supabase
        .from('categorias')
        .insert({ ...form, ordem: maxOrdem });
      if (err) setError(err.message.includes('duplicate key')
        ? 'Esse slug já está em uso por outra categoria.'
        : err.message);
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      fetchCategorias();
    }
  };

  const handleDelete = async (cat: Categoria) => {
    // Verificar se tem trabalhos usando essa categoria
    const { count } = await supabase
      .from('trabalhos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria', cat.slug);

    if (count && count > 0) {
      alert(`Não é possível excluir "${cat.nome}" pois ela possui ${count} trabalho(s) vinculado(s). Remova ou mude a categoria dos trabalhos primeiro.`);
      return;
    }

    if (!confirm(`Excluir a categoria "${cat.nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(cat.id);
    await supabase.from('categorias').delete().eq('id', cat.id);
    fetchCategorias();
    setDeleting(null);
  };

  const moveOrdem = async (index: number, direction: 'up' | 'down') => {
    const newList = [...categorias];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;

    // Atualizar ordens
    await Promise.all(
      newList.map((cat, i) =>
        supabase.from('categorias').update({ ordem: i + 1 }).eq('id', cat.id)
      )
    );
    fetchCategorias();
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Categorias</h1>
          <p className="text-white/40 text-sm">Gerencie as categorias do portfólio</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#00FF88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {/* Formulário inline */}
      {showForm && (
        <div className="bg-white/[0.04] border border-[#00FF88]/20 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
                placeholder="Ex: Motion Graphics"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">
                Slug * <span className="text-white/20 normal-case">(usado na URL e no código)</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white/60 font-mono text-sm placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
                placeholder="motion-graphics"
              />
              <p className="text-white/20 text-xs mt-1">Gerado automaticamente. Só letras minúsculas, números e hífens.</p>
            </div>

            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Descrição (PT)</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                rows={2}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all resize-none"
                placeholder="Breve descrição da categoria..."
              />
            </div>

            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Descrição (EN)</label>
              <textarea
                value={form.descricao_en}
                onChange={(e) => setForm((f) => ({ ...f, descricao_en: e.target.value }))}
                rows={2}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all resize-none"
                placeholder="Brief description of the category..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#00FF88]/90 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 border border-white/10 text-white/50 hover:text-white text-sm px-5 py-2.5 rounded-xl hover:border-white/30 transition-all"
              >
                <X size={14} /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-white/30 gap-3">
          <p>Nenhuma categoria cadastrada.</p>
          <button onClick={openNew} className="text-[#00FF88] text-sm hover:underline">Criar a primeira</button>
        </div>
      ) : (
        <div className="space-y-2">
          {categorias.map((cat, index) => (
            <div
              key={cat.id}
              className="bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all group"
            >
              {/* Reordenar */}
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveOrdem(index, 'up')}
                  disabled={index === 0}
                  className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Mover para cima"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveOrdem(index, 'down')}
                  disabled={index === categorias.length - 1}
                  className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Mover para baixo"
                >
                  ▼
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{cat.nome}</span>
                  <span className="font-mono text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-md">{cat.slug}</span>
                </div>
                {cat.descricao && (
                  <p className="text-white/30 text-xs mt-1 truncate">{cat.descricao}</p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deleting === cat.id}
                  className="w-8 h-8 flex items-center justify-center bg-red-500/5 hover:bg-red-500/15 rounded-lg text-red-400/40 hover:text-red-400 transition-all disabled:opacity-50"
                  title="Excluir"
                >
                  {deleting === cat.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aviso */}
      <p className="text-white/20 text-xs mt-6">
        💡 As categorias aparecem automaticamente nos filtros do site após serem criadas aqui.
      </p>
    </div>
  );
}
