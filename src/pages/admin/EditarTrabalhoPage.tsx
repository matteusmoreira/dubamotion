import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Trabalho, TrabalhoMedia } from '@/lib/supabase';
import { ArrowLeft, Upload, X, Check, Loader2, Link as LinkIcon, Youtube, Image as ImageIcon } from 'lucide-react';



type FormData = {
  titulo: string;
  titulo_en: string;
  descricao: string;
  descricao_en: string;
  categoria: string;
  ano: string;
  vimeo_url: string;
  ordem: number;
  publicado: boolean;
  capa_url: string;
  midias: TrabalhoMedia[];
};

const defaultForm: FormData = {
  titulo: '',
  titulo_en: '',
  descricao: '',
  descricao_en: '',
  categoria: 'mixed',
  ano: '',
  vimeo_url: '',
  ordem: 0,
  publicado: true,
  capa_url: '',
  midias: [],
};

export default function EditarTrabalhoPage() {
  const { id } = useParams();
  const isNew = id === 'novo';
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState<{id: string, label: string}[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Carregar trabalho existente ao editar e categorias
  useEffect(() => {
    supabase.from('categorias').select('nome, slug').order('ordem').then(({ data }) => {
      if (data) setCategories(data.map(c => ({ id: c.slug, label: c.nome })));
    });

    if (!isNew && id) {
      supabase
        .from('trabalhos')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              titulo: data.titulo || '',
              titulo_en: data.titulo_en || '',
              descricao: data.descricao || '',
              descricao_en: data.descricao_en || '',
              categoria: data.categoria || 'mixed',
              ano: data.ano || '',
              vimeo_url: data.vimeo_url || '',
              ordem: data.ordem || 0,
              publicado: data.publicado ?? true,
              capa_url: data.capa_url || '',
              midias: data.midias || [],
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  // Converte arquivo de imagem local para WebP
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
        }, 'image/webp', 0.85);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de imagem para o Supabase Storage (Capa)
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const webpFile = await convertToWebp(file);
      const fileName = `${Date.now()}.webp`;
      const { data } = await supabase.storage
        .from('trabalhos-capas')
        .upload(fileName, webpFile, { upsert: true });

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('trabalhos-capas')
          .getPublicUrl(data.path);
        setForm((f) => ({ ...f, capa_url: publicUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao converter imagem da capa.');
    }
    setUploading(false);
  };

  // Upload de Media extra para a Galeria
  const handleUploadMedia = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const webpFile = await convertToWebp(file);
      const fileName = `${Date.now()}_media_${Math.random().toString(36).substring(7)}.webp`;
      const { data } = await supabase.storage
        .from('trabalhos-capas')
        .upload(fileName, webpFile, { upsert: true });

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('trabalhos-capas')
          .getPublicUrl(data.path);
        const newMedia: TrabalhoMedia = {
          id: Math.random().toString(36).substring(7),
          tipo: 'image',
          url: publicUrl
        };
        setForm((f) => ({ ...f, midias: [...f.midias, newMedia] }));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao converter imagem para a galeria.');
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // Salvar trabalho
  const handleSave = async () => {
    if (!form.titulo.trim()) return alert('O título é obrigatório.');
    setSaving(true);

    if (isNew) {
      const { error } = await supabase.from('trabalhos').insert({
        ...form,
        categoria: form.categoria as Trabalho['categoria'],
      });
      if (!error) {
        setSaving(false);
        navigate('/admin/trabalhos');
      }
    } else {
      const { error } = await supabase.from('trabalhos').update({
        ...form,
        categoria: form.categoria as Trabalho['categoria'],
      }).eq('id', id);
      setSaving(false);
      if (!error) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Topo */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? 'Novo Trabalho' : 'Editar Trabalho'}
          </h1>
          <p className="text-white/40 text-sm">{isNew ? 'Preencha os dados abaixo' : form.titulo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Formulário principal */}
        <div className="space-y-5">
          {/* Título PT */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
              placeholder="Nome do projeto"
            />
          </div>

          {/* Título EN */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Título em inglês
            </label>
            <input
              type="text"
              value={form.titulo_en}
              onChange={(e) => setForm((f) => ({ ...f, titulo_en: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
              placeholder="Project name"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Categoria
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#111] text-white">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Ano
            </label>
            <input
              type="text"
              value={form.ano}
              onChange={(e) => setForm((f) => ({ ...f, ano: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
              placeholder="Ex: 2024"
            />
          </div>

          {/* Vimeo URL */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <LinkIcon size={11} /> Link
            </label>
            <input
              type="url"
              value={form.vimeo_url}
              onChange={(e) => setForm((f) => ({ ...f, vimeo_url: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all"
              placeholder="Ex: https://behance.net/..."
            />
            {form.vimeo_url && (
              <p className="text-white/30 text-xs mt-1.5 truncate">{form.vimeo_url}</p>
            )}
          </div>

          {/* Descrição PT */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Descrição (PT)
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              rows={3}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all resize-none"
              placeholder="Descrição curta do trabalho..."
            />
          </div>

          {/* Descrição EN */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Descrição (EN)
            </label>
            <textarea
              value={form.descricao_en}
              onChange={(e) => setForm((f) => ({ ...f, descricao_en: e.target.value }))}
              rows={3}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 transition-all resize-none"
              placeholder="Short description of the work..."
            />
          </div>

          {/* Ordem */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Ordem de exibição
            </label>
            <input
              type="number"
              value={form.ordem}
              onChange={(e) => setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FF88]/50 transition-all"
            />
            <p className="text-white/20 text-xs mt-1.5">Número menor = aparece primeiro</p>
          </div>

          {/* Mídias adicionais (Galeria) */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest text-[#00FF88]">Galeria do Projeto (Imagens e Vídeos)</h3>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setForm(f => ({
                        ...f,
                        midias: [...f.midias, { id: Math.random().toString(36).substring(7), tipo: 'youtube', url: val }]
                      }));
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="bg-[#00FF88]/20 text-[#00FF88] px-4 py-2 sm:py-0 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#00FF88]/30 transition-colors"
                onClick={(e) => {
                  const val = (e.currentTarget.previousElementSibling as HTMLInputElement).value.trim();
                  if (val) {
                    setForm(f => ({
                      ...f,
                      midias: [...f.midias, { id: Math.random().toString(36).substring(7), tipo: 'youtube', url: val }]
                    }));
                    (e.currentTarget.previousElementSibling as HTMLInputElement).value = '';
                  }
                }}
              >
                <Youtube size={16} /> Adicionar YouTube
              </button>
            </div>
            
            {/* Upload Imagens Multiple */}
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                Array.from(e.dataTransfer.files).forEach(f => {
                   if (f.type.startsWith('image/')) handleUploadMedia(f);
                });
              }}
              className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => document.getElementById('multi-image-upload')?.click()}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                id="multi-image-upload" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                     Array.from(e.target.files).forEach(f => handleUploadMedia(f));
                  }
                  e.target.value = '';
                }}
              />
              <div className="flex flex-col items-center gap-2 text-white/50 group-hover:text-white transition-colors">
                <ImageIcon size={24} className="mb-1" />
                <span className="text-sm">Clique ou arraste várias imagens para a galeria</span>
                <span className="text-xs text-white/30">Convertidas automaticamente para WebP</span>
              </div>
            </div>

            {/* List Media */}
            {form.midias.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {form.midias.map((m, idx) => (
                  <div key={m.id} className="relative aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group">
                    {m.tipo === 'image' ? (
                      <img src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-2 relative w-full h-full justify-center bg-black/40">
                          <Youtube size={24} className="text-red-500" />
                          <span className="text-[10px] text-white/50 text-center px-1 break-all line-clamp-2">{m.url}</span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, midias: f.midias.filter(x => x.id !== m.id) })); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Coluna direita: capa + publicar */}
        <div className="space-y-4">
          {/* Upload de capa */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Imagem de Capa
            </label>

            {/* Preview */}
            {form.capa_url && !uploading && (
              <div className="relative mb-3 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                <img src={form.capa_url} alt="Capa" className="w-full h-full object-cover" />
                <button
                  onClick={() => setForm((f) => ({ ...f, capa_url: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-500/70 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-8 ${
                dragOver
                  ? 'border-[#00FF88] bg-[#00FF88]/10'
                  : 'border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={24} className="text-[#00FF88] animate-spin" />
                  <p className="text-white/40 text-sm">Enviando...</p>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-white/30" />
                  <div className="text-center">
                    <p className="text-white/50 text-sm">{form.capa_url ? 'Trocar imagem' : 'Arraste ou clique'}</p>
                    <p className="text-white/20 text-xs mt-1">JPG, PNG, WebP, GIF</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Publicado toggle */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">Visível no site</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {form.publicado ? 'Aparece no portfólio' : 'Oculto do portfólio'}
                </p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, publicado: !f.publicado }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  form.publicado ? 'bg-[#00FF88]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-black rounded-full shadow transition-transform duration-300 ${
                    form.publicado ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Botão salvar */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full flex items-center justify-center gap-2 bg-[#00FF88] text-black font-bold py-4 rounded-xl hover:bg-[#00FF88]/90 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Salvando...</>
            ) : savedMsg ? (
              <><Check size={16} /> Salvo!</>
            ) : (
              isNew ? 'Criar Trabalho' : 'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
