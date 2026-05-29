import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Check, X, Loader2, Upload, ArrowUp, ArrowDown, Download } from 'lucide-react';

type LogoCliente = {
  id: string;
  nome: string;
  logo_url: string;
  ordem: number;
  created_at?: string;
};

const emptyForm = { nome: '', logo_url: '' };

const fallbackClientLogos = [
  "Bradesco.png", "Lexus.png", "Next.png", "Toyota.png", "Vivo.png",
  "Yamaha.png", "c6bank.png", "casas bahia.png", "cna.png", "garoto.png",
  "itau.png", "kuat.png", "live now.png", "mercado livre.png", "mitsubishi.png",
  "nissan.png", "nu bank.png", "renner.png", "suzuki.png", "tik tok.png"
];

export default function LogosPage() {
  const [logos, setLogos] = useState<LogoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const importarLogosPadrao = async () => {
    setImporting(true);
    setError('');
    try {
      const novosLogos = fallbackClientLogos.map((filename, index) => {
        const nomeFormatado = filename
          .replace(/\.[^/.]+$/, "")
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return {
          nome: nomeFormatado,
          logo_url: `/Logotipos/${filename}`,
          ordem: index + 1
        };
      });

      const { error: insertErr } = await supabase
        .from('logos_clientes')
        .insert(novosLogos);

      if (insertErr) {
        if (insertErr.code === '42P01') {
          throw new Error('A tabela "logos_clientes" não foi encontrada no banco. Por favor, execute o script SQL disponibilizado no Supabase.');
        }
        throw insertErr;
      }

      await fetchLogos();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao importar logotipos padrão.');
    } finally {
      setImporting(false);
    }
  };

  const fetchLogos = async () => {
    try {
      const { data, error: err } = await supabase
        .from('logos_clientes')
        .select('*')
        .order('ordem')
        .order('created_at', { ascending: false });

      if (err) {
        // Se a tabela não existir, trata como lista vazia
        console.warn('A tabela de logos_clientes pode não ter sido criada no Supabase ainda:', err.message);
        setLogos([]);
      } else {
        setLogos(data || []);
      }
    } catch (e) {
      console.error('Erro ao buscar logotipos:', e);
      setLogos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (logo: LogoCliente) => {
    setEditingId(logo.id);
    setForm({
      nome: logo.nome,
      logo_url: logo.logo_url,
    });
    setError('');
    setShowForm(true);
  };

  // Conversão de imagem local para WebP
  const convertToWebp = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return reject('Conversion failed');
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newName, { type: 'image/webp' });
          resolve(newFile);
        }, 'image/webp', 0.90); // Otimização a 90% para qualidade e leveza
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload da logo para o Storage
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Selecione apenas arquivos de imagem.');

    setUploading(true);
    try {
      const isGif = file.type === 'image/gif';
      const fileToUpload = isGif ? file : await convertToWebp(file);
      const extension = isGif ? 'gif' : 'webp';
      const fileName = `logos/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('trabalhos-capas')
        .upload(fileName, fileToUpload, { upsert: true });

      if (uploadErr) throw uploadErr;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('trabalhos-capas')
          .getPublicUrl(data.path);
        setForm((f) => ({ ...f, logo_url: publicUrl }));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao processar/enviar imagem: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return setError('O nome da marca é obrigatório.');
    if (!form.logo_url) return setError('O upload da imagem do logotipo é obrigatório.');
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const { error: err } = await supabase
          .from('logos_clientes')
          .update({ nome: form.nome, logo_url: form.logo_url })
          .eq('id', editingId);

        if (err) throw err;
      } else {
        const maxOrdem = logos.length ? Math.max(...logos.map((l) => l.ordem)) + 1 : 1;
        const { error: err } = await supabase
          .from('logos_clientes')
          .insert({ nome: form.nome, logo_url: form.logo_url, ordem: maxOrdem });

        if (err) {
          if (err.code === '42P01') {
            throw new Error('A tabela "logos_clientes" não foi encontrada no banco. Por favor, execute o script SQL disponibilizado no Supabase.');
          }
          throw err;
        }
      }

      setShowForm(false);
      fetchLogos();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar logotipo no banco.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logo: LogoCliente) => {
    if (!confirm(`Excluir o logotipo da marca "${logo.nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(logo.id);
    try {
      const { error: err } = await supabase
        .from('logos_clientes')
        .delete()
        .eq('id', logo.id);

      if (err) throw err;
      
      // Opcional: deletar arquivo do storage se for URL do supabase
      if (logo.logo_url.includes('trabalhos-capas')) {
        const path = logo.logo_url.split('/trabalhos-capas/')[1];
        if (path) {
          await supabase.storage.from('trabalhos-capas').remove([path]);
        }
      }
      
      fetchLogos();
    } catch (e: any) {
      console.error(e);
      alert('Erro ao excluir logotipo: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const moveOrdem = async (index: number, direction: 'up' | 'down') => {
    const newList = [...logos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;

    // Atualizar ordens sequenciais
    try {
      await Promise.all(
        newList.map((logo, i) =>
          supabase
            .from('logos_clientes')
            .update({ ordem: i + 1 })
            .eq('id', logo.id)
        )
      );
      fetchLogos();
    } catch (e) {
      console.error('Erro ao reordenar logotipos:', e);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Logotipos</h1>
          <p className="text-white/40 text-sm">Gerencie as logos dos clientes que rolam no carrossel do site</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#00FF88]/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
        >
          <Plus size={16} /> Novo Logotipo
        </button>
      </div>

      {/* Formulário inline */}
      {showForm && (
        <div className="bg-white/[0.04] border border-[#00FF88]/20 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5">
            {editingId ? 'Editar Logotipo' : 'Novo Logotipo'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-1.5">Marca / Empresa *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
                placeholder="Ex: Coca-Cola"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Imagem do Logotipo *</label>
              
              {/* Preview */}
              {form.logo_url && !uploading && (
                <div className="relative mb-3 w-40 h-24 bg-white rounded-xl p-4 flex items-center justify-center border border-white/10 group">
                  <img src={form.logo_url} alt="Logo" className="max-w-full max-h-full object-contain grayscale" />
                  <button
                    onClick={() => setForm((f) => ({ ...f, logo_url: '' }))}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Upload input */}
              {!form.logo_url && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={20} className="text-[#00FF88] animate-spin" />
                      <p className="text-white/40 text-xs">Enviando e convertendo imagem...</p>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-white/30" />
                      <div className="text-center">
                        <p className="text-white/50 text-xs">Arraste ou clique para enviar a imagem</p>
                        <p className="text-white/20 text-[10px] mt-0.5">JPG, PNG, WebP (Será convertido para WebP)</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#00FF88]/90 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editingId ? 'Salvar Alterações' : 'Adicionar Logotipo'}
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

      {/* Lista de Logos */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-[#00FF88]/10 text-[#00FF88] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
            <Download size={28} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Importar Logotipos do Site</h2>
          <p className="text-white/40 text-sm mb-6 max-w-md">
            Identificamos que você ainda não tem logotipos cadastrados no Supabase. Gostaria de importar automaticamente os 20 logotipos padrões que já rolam no carrossel do site para poder gerenciá-los?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={importarLogosPadrao}
              disabled={importing}
              className="flex items-center justify-center gap-2 bg-[#00FF88] text-black text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-[#00FF88]/90 disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(0,255,136,0.15)]"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Importar 20 Logotipos Padrão
                </>
              )}
            </button>
            <button
              onClick={openNew}
              disabled={importing}
              className="flex items-center justify-center gap-2 border border-white/10 text-white hover:bg-white/[0.05] text-sm font-semibold px-6 py-3.5 rounded-xl transition-all"
            >
              <Plus size={16} />
              Adicionar Manualmente
            </button>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs w-full text-left whitespace-pre-line">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logos.map((logo, index) => (
            <div
              key={logo.id}
              className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all group"
            >
              {/* Reordenar */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveOrdem(index, 'up')}
                  disabled={index === 0}
                  className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-[#00FF88]/10 hover:text-[#00FF88] rounded-md text-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Mover para cima"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => moveOrdem(index, 'down')}
                  disabled={index === logos.length - 1}
                  className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-[#00FF88]/10 hover:text-[#00FF88] rounded-md text-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  title="Mover para baixo"
                >
                  <ArrowDown size={12} />
                </button>
              </div>

              {/* Preview da Logo */}
              <div className="w-24 h-16 bg-white rounded-xl p-2 flex items-center justify-center border border-white/10 shrink-0">
                <img
                  src={logo.logo_url}
                  alt={logo.nome}
                  className="max-w-full max-h-full object-contain grayscale opacity-80 hover:opacity-100"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate text-sm">{logo.nome}</h3>
                <p className="text-white/20 text-[10px] font-mono mt-0.5 truncate">Ordem: {logo.ordem}</p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(logo)}
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(logo)}
                  disabled={deleting === logo.id}
                  className="w-8 h-8 flex items-center justify-center bg-red-500/5 hover:bg-red-500/15 rounded-lg text-red-400/40 hover:text-red-400 transition-all disabled:opacity-50"
                  title="Excluir"
                >
                  {deleting === logo.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
