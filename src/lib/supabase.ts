import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TrabalhoMedia = {
  id: string;
  tipo: 'image' | 'youtube';
  url: string;
};

export type Trabalho = {
  id: string;
  titulo: string;
  titulo_en: string | null;
  descricao: string | null;
  descricao_en: string | null;
  categoria: string;
  ano: string | null;
  capa_url: string | null;
  vimeo_url: string | null;
  midias: TrabalhoMedia[];
  ordem: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};
