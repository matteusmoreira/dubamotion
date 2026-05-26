import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Language } from '../data/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Função para detectar o idioma inicial
const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('user-language') as Language;
        if (savedLang === 'pt' || savedLang === 'en') {
            return savedLang;
        }

        const browserLang = navigator.language || (navigator as any).userLanguage;
        if (browserLang && browserLang.startsWith('pt')) {
            return 'pt';
        }
    }
    return 'en'; // Padrão se não for português
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('user-language', lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k as keyof typeof value];
            } else {
                return key; // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

