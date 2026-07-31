import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TrabalhoMedia = {
  id: string;
  tipo: 'image' | 'video' | 'youtube' | 'vimeo';
  url: string;
};

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4v')
  );
}

export type Categoria = {
  id: string;
  nome: string;
  nome_en: string | null;
  slug: string;
  descricao: string | null;
  descricao_en: string | null;
  ordem: number;
};

export type Trabalho = {
  id: string;
  titulo: string;
  titulo_en: string | null;
  descricao: string | null;
  descricao_en: string | null;
  categoria: string | string[];
  creditos: string | null;
  ano: string | null;
  capa_url: string | null;
  vimeo_url: string | null;
  midias: TrabalhoMedia[];
  ordem: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

export function getProjectCategories(categoria: string | string[] | null | undefined): string[] {
  if (!categoria) return [];
  if (Array.isArray(categoria)) return categoria.map((c) => String(c).trim()).filter(Boolean);
  if (typeof categoria === 'string') {
    const trimmed = categoria.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((c) => String(c).trim()).filter(Boolean);
      } catch (e) {
        // Fallback para split por vírgula
      }
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

