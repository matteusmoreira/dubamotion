import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Trabalho } from '../lib/supabase';
import { useEffect, useState } from 'react';

const ProjectPage = () => {
    const { t, language } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Trabalho | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            supabase
                .from('trabalhos')
                .select('*')
                .eq('id', id)
                .single()
                .then(({ data }) => {
                    setProject(data);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 text-[#00FF88] animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('project.notFound')}</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#00FF88] hover:underline"
                    >
                        {t('project.backHome')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#00FF88] selection:text-black">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 lg:p-12 flex justify-between items-center mix-blend-difference">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-white/70 hover:text-[#00FF88] transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="text-lg font-medium">{t('project.back')}</span>
                </button>
            </nav>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative h-screen w-full flex items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={project.capa_url || ''}
                        alt={project.titulo}
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full mt-20">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-2 border border-[#00FF88]/30 rounded-full text-[#00FF88] text-sm tracking-widest uppercase mb-6 backdrop-blur-sm bg-black/20">
                            {project.categoria}
                        </span>
                        <h1 className="text-6xl lg:text-9xl font-bold mb-6 tracking-tight">
                            {language === 'en' ? (project.titulo_en || project.titulo) : project.titulo}
                        </h1>
                        <p className="text-xl lg:text-3xl text-white/80 max-w-2xl font-light leading-relaxed">
                            {language === 'en' ? (project.descricao_en || project.descricao) : project.descricao}
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#00FF88] to-transparent animate-pulse" />
                    <span className="text-xs text-[#00FF88]/70 tracking-widest uppercase">Scroll</span>
                </motion.div>
            </motion.section>

            {/* Content Section */}
            <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Project Details */}
                    <div className="lg:col-span-4 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >

                            <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4">{t('project.client')}</h3>
                            <p className="text-2xl font-medium border-l-2 border-[#00FF88] pl-6">
                                {language === 'en' ? (project.titulo_en || project.titulo) : project.titulo}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >

                            <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4">{t('project.services')}</h3>
                            <ul className="space-y-2 text-lg text-white/80 pl-6 border-l-2 border-white/10">
                                <li className="capitalize">{project.categoria}</li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >

                            <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4">{t('project.year')}</h3>
                            <p className="text-xl text-white/80 pl-6 border-l-2 border-white/10">{project.ano || '2024'}</p>
                        </motion.div>

                        {project.vimeo_url && (
                            <a
                                href={project.vimeo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group flex items-center gap-3 bg-[#00FF88] text-black px-8 py-4 rounded-full font-bold mt-8"
                                >
                                    <span>{t('project.viewLive')}</span>
                                    <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                                </motion.button>
                            </a>
                        )}
                    </div>

                    {/* Project Gallery/Description */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-xl lg:text-2xl leading-relaxed text-white/80 mb-12">
                                {language === 'en' ? (project.descricao_en || project.descricao) : project.descricao}
                            </p>
                        </motion.div>

                        {/* Project Gallery from midias */}
                        {project.midias && project.midias.length > 0 && (
                            <div className="grid grid-cols-1 gap-12">
                                {project.midias.map((media, index) => {
                                    if (media.tipo === 'image') {
                                        return (
                                            <motion.div
                                                key={media.id || index}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                transition={{ duration: 0.8 }}
                                                className="w-full rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 flex justify-center"
                                            >
                                                <img 
                                                    src={media.url} 
                                                    alt={`Project detail ${index + 1}`} 
                                                    className="w-full h-auto block" 
                                                />
                                            </motion.div>
                                        );
                                    } else if (media.tipo === 'youtube') {
                                        const getYoutubeEmbedUrl = (url: string) => {
                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                            const match = url.match(regExp);
                                            return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
                                        };
                                        return (
                                            <motion.div
                                                key={media.id || index}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                transition={{ duration: 0.8 }}
                                                className="w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10"
                                            >
                                                <iframe
                                                    src={getYoutubeEmbedUrl(media.url)}
                                                    className="w-full h-full"
                                                    title={`YouTube video ${index + 1}`}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </motion.div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Next Project Teaser (Simple Implementation) */}
            <section className="py-24 border-t border-white/10 mt-12 bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-bold mb-8">{t('project.cta.title')}</h2>
                    <button onClick={() => navigate('/#contact')} className="text-[#00FF88] text-xl hover:text-white transition-colors underline decoration-2 underline-offset-8">
                        {t('project.cta.button')}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ProjectPage;
