import React, { useState, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, ExternalLink, Eye, Edit3, X, Check } from 'lucide-react';
import { RichText } from '../RichText';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Digite aqui...',
  rows = 4,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showBtnModal, setShowBtnModal] = useState(false);

  // Estados dos modais de link e botão
  const [modalText, setModalText] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [isButtonType, setIsButtonType] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inserção no ponto do cursor no textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultContent: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + `${prefix}${defaultContent}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultContent;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleOpenModal = (isButton: boolean) => {
    setIsButtonType(isButton);
    const textarea = textareaRef.current;
    if (textarea) {
      const selectedText = value.substring(textarea.selectionStart, textarea.selectionEnd);
      setModalText(selectedText);
    } else {
      setModalText('');
    }
    setModalUrl('');
    if (isButton) {
      setShowBtnModal(true);
    } else {
      setShowLinkModal(true);
    }
  };

  const handleConfirmInsert = () => {
    const text = modalText.trim() || (isButtonType ? 'Clique aqui' : 'Link');
    let url = modalUrl.trim() || 'https://';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    if (isButtonType) {
      insertFormatting(`[button:${text}|`, `]`, url);
      setShowBtnModal(false);
    } else {
      insertFormatting(`[${text}](`, `)`, url);
      setShowLinkModal(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-white/50 text-xs uppercase tracking-widest font-medium">
          {label}
        </label>
        
        {/* Toggle Editar / Pré-visualizar */}
        <div className="flex items-center bg-white/[0.05] p-1 rounded-lg border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'edit'
                ? 'bg-[#00FF88] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Edit3 size={12} /> Editar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#00FF88] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Eye size={12} /> Visualizar
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#00FF88]/50 transition-all">
          {/* Barra de Ferramentas */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-white/[0.02] border-b border-white/10 text-white/70">
            <button
              type="button"
              title="Negrito"
              onClick={() => insertFormatting('**', '**', 'texto em negrito')}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              title="Itálico"
              onClick={() => insertFormatting('*', '*', 'texto em itálico')}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <Italic size={14} />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button
              type="button"
              title="Inserir Link"
              onClick={() => handleOpenModal(false)}
              className="p-1.5 hover:bg-[#00FF88]/20 hover:text-[#00FF88] rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <LinkIcon size={14} /> Link
            </button>
            <button
              type="button"
              title="Inserir Botão"
              onClick={() => handleOpenModal(true)}
              className="p-1.5 bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-[#00FF88]/30 ml-1"
            >
              <ExternalLink size={13} /> + Botão
            </button>

            <div className="ml-auto text-[10px] text-white/30 hidden sm:block">
              Suporta Markdown & Botões
            </div>
          </div>

          {/* Área de Texto */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full bg-transparent p-3 text-white placeholder-white/20 focus:outline-none resize-y text-sm font-sans leading-relaxed"
          />
        </div>
      ) : (
        /* Painel de Pré-visualização */
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[120px]">
          {value.trim() ? (
            <RichText content={value} className="text-white/80 text-sm" />
          ) : (
            <p className="text-white/20 italic text-xs">Nenhum conteúdo para pré-visualizar.</p>
          )}
        </div>
      )}

      {/* Dicas de sintaxe rápida */}
      <div className="flex flex-wrap gap-2 text-[11px] text-white/40 pt-1">
        <span className="bg-white/5 px-2 py-0.5 rounded font-mono">**negrito**</span>
        <span className="bg-white/5 px-2 py-0.5 rounded font-mono">*itálico*</span>
        <span className="bg-white/5 px-2 py-0.5 rounded font-mono">[Link](url)</span>
        <span className="bg-[#00FF88]/10 text-[#00FF88] px-2 py-0.5 rounded font-mono border border-[#00FF88]/20">
          [button:Texto|url]
        </span>
      </div>

      {/* Modal / Dialog para Link ou Botão */}
      {(showLinkModal || showBtnModal) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isButtonType ? (
                  <>
                    <ExternalLink size={18} className="text-[#00FF88]" /> Inserir Botão CTA
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} className="text-[#00FF88]" /> Inserir Hyperlink
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setShowBtnModal(false);
                }}
                className="text-white/40 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">
                  {isButtonType ? 'Texto do Botão' : 'Texto do Link'}
                </label>
                <input
                  type="text"
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder={isButtonType ? 'Ex: Acesse o projeto completo' : 'Ex: Clique aqui'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">URL de Destino</label>
                <input
                  type="url"
                  value={modalUrl}
                  onChange={(e) => setModalUrl(e.target.value)}
                  placeholder="https://behance.net/meu-projeto"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FF88]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmInsert();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setShowBtnModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmInsert}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00FF88] text-black hover:bg-[#00E077] transition-all flex items-center gap-1.5"
              >
                <Check size={14} /> Inserir {isButtonType ? 'Botão' : 'Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
