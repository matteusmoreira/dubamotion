import React from 'react';
import { ExternalLink } from 'lucide-react';

interface RichTextProps {
  content?: string | null;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Quebra por linhas para tratar parágrafos
  const paragraphs = content.split(/\r?\n/);

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, pIndex) => {
        if (!paragraph.trim()) {
          return <div key={pIndex} className="h-2" />;
        }

        const elements = parseInline(paragraph);

        return (
          <div key={pIndex} className="leading-relaxed">
            {elements}
          </div>
        );
      })}
    </div>
  );
};

function parseInline(text: string): React.ReactNode[] {
  // Matches:
  // 1. [button:Texto|URL] ou [btn:Texto|URL]
  // 2. [Texto](URL)
  // 3. **negrito**
  // 4. *itálico*
  const regex = /\[(?:button|btn):([^|\]]+)(?:\|)([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Texto comum antes do match
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const [, btnLabel, btnUrl, linkLabel, linkUrl, boldText, italicText] = match;

    if (btnLabel && btnUrl) {
      const url = btnUrl.trim().startsWith('http') ? btnUrl.trim() : `https://${btnUrl.trim()}`;
      nodes.push(
        <span key={`btn-wrap-${match.index}`} className="inline-block my-1 mr-2 align-middle">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00FF88] text-black px-6 py-2.5 rounded-full font-bold hover:bg-[#00E077] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-md shadow-[#00FF88]/20 group text-sm border border-[#00FF88]/50"
          >
            <span>{btnLabel.trim()}</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </span>
      );
    } else if (linkLabel && linkUrl) {
      const url = linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00FF88] hover:text-[#00E077] font-semibold underline underline-offset-4 decoration-[#00FF88]/40 hover:decoration-[#00FF88] inline-flex items-center gap-1 transition-colors px-0.5"
        >
          <span>{linkLabel.trim()}</span>
          <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
        </a>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-bold text-white">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(
        <em key={`italic-${match.index}`} className="italic text-white/90">
          {italicText}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

export default RichText;
