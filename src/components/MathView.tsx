import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  text?: string;
  block?: boolean;
  className?: string;
}

/**
 * MathView renders LaTeX mathematics either directly or mixed inside markdown-style text.
 * Inline math syntax: $...$
 * Block math syntax: $$...$$
 */
export const MathView: React.FC<MathViewProps> = ({ math, text, block = false, className = '' }) => {
  // If pure math is provided directly
  if (math) {
    const html = useMemo(() => {
      try {
        return katex.renderToString(math, {
          displayMode: block,
          throwOnError: false,
        });
      } catch {
        return `<span class="text-rose-400 font-mono text-sm">${math}</span>`;
      }
    }, [math, block]);

    return (
      <span
        className={`inline-block ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Parse mixed text with inline and block math
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Split text by block math ($$...$$) first, then inline math ($...$)
    const parts: React.ReactNode[] = [];
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    let lastIndex = 0;
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = blockRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, blockMatch.index);
      if (precedingText) {
        parts.push(renderInlineMathAndText(precedingText, `${lastIndex}`));
      }

      const formula = blockMatch[1].trim();
      try {
        const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
        parts.push(
          <div
            key={`block-${blockMatch.index}`}
            className="my-3 overflow-x-auto text-center py-2 px-3 bg-slate-900/60 rounded-lg border border-slate-800 text-indigo-200"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        parts.push(
          <pre key={`block-err-${blockMatch.index}`} className="my-2 p-2 bg-slate-900 text-rose-300 font-mono text-xs">
            {formula}
          </pre>
        );
      }
      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderInlineMathAndText(text.substring(lastIndex), `${lastIndex}`));
    }

    return parts;
  }, [text]);

  return <div className={`leading-relaxed ${className}`}>{renderedContent}</div>;
};

function renderInlineMathAndText(segment: string, keyPrefix: string): React.ReactNode {
  const inlineRegex = /\$([^\$]+?)\$/g;
  const items: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(segment)) !== null) {
    const textChunk = segment.substring(lastIdx, match.index);
    if (textChunk) {
      items.push(<span key={`${keyPrefix}-t-${lastIdx}`}>{textChunk}</span>);
    }

    const formula = match[1].trim();
    try {
      const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
      items.push(
        <span
          key={`${keyPrefix}-m-${match.index}`}
          className="mx-1 text-indigo-300 font-medium"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      items.push(
        <span key={`${keyPrefix}-merr-${match.index}`} className="text-amber-400 font-mono text-xs">
          ${formula}$
        </span>
      );
    }
    lastIdx = inlineRegex.lastIndex;
  }

  if (lastIdx < segment.length) {
    items.push(<span key={`${keyPrefix}-t-end`}>{segment.substring(lastIdx)}</span>);
  }

  return <span key={keyPrefix}>{items}</span>;
}
