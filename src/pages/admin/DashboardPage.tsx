import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const categories = [
  { id: 'mixed', label: 'Mixed Midia', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'publicidade', label: 'Publicidade', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'social', label: 'Social Ads', color: 'bg-pink-500/20 text-pink-300' },
  { id: 'video-cases', label: 'Video Cases', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'autoral', label: 'Autoral e Estudos', color: 'bg-green-500/20 text-green-300' },
];

interface Stats {
  total: number;
  publicados: number;
  byCategory: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, publicados: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('trabalhos').select('categoria, publicado');
      if (data) {
        const byCategory: Record<string, number> = {};
        let publicados = 0;
        data.forEach((t) => {
          byCategory[t.categoria] = (byCategory[t.categoria] || 0) + 1;
          if (t.publicado) publicados++;
        });
        setStats({ total: data.length, publicados, byCategory });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Visão geral do seu portfólio</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Números gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total de Trabalhos', value: stats.total, color: 'text-white' },
              { label: 'Publicados', value: stats.publicados, color: 'text-[#00FF88]' },
              { label: 'Não publicados', value: stats.total - stats.publicados, color: 'text-white/40' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3">{item.label}</p>
                <p className={`text-5xl font-black ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Por categoria */}
          <h2 className="text-white/50 text-xs uppercase tracking-widest mb-4">Por Categoria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex items-center justify-between"
              >
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
                <span className="text-3xl font-black text-white">
                  {stats.byCategory[cat.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
