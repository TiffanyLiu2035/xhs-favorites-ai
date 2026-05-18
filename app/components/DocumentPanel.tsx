'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { productDocContent } from '../data/product-doc-content';

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-[#333] hover:bg-[#555] text-gray-300 transition-colors duration-150"
    >
      {copied ? '\u5DF2\u590D\u5236 \u2713' : '\u590D\u5236'}
    </button>
  );
}

// Helper to extract text from React children
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children) && (children.props as Record<string, unknown>)?.children) {
    return extractText((children.props as Record<string, unknown>).children as React.ReactNode);
  }
  return '';
}

// Collapsible wrapper for long code blocks
function CollapsiblePre({ children }: { children: React.ReactNode }) {
  const codeContent = extractText(children);
  const lineCount = codeContent.split('\n').length;
  const isLong = lineCount > 5;
  const [collapsed, setCollapsed] = useState(isLong);

  if (!isLong) {
    return (
      <pre className="relative mb-4 rounded-lg">
        <CopyButton code={codeContent} />
        {children}
      </pre>
    );
  }

  return (
    <div className="relative mb-4 rounded-lg">
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={collapsed ? { maxHeight: '72px' } : { maxHeight: '400px', overflowY: 'auto' }}
      >
        <pre className="relative rounded-lg">
          <CopyButton code={codeContent} />
          {children}
        </pre>
        {collapsed && (
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(30,30,30,0), rgba(30,30,30,1))',
            }}
          />
        )}
      </div>
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-200 bg-[#1E1E1E] rounded-b-lg border-t border-[#333] transition-colors duration-150"
      >
        {collapsed ? '展开 ▼' : '收起 ▲'}
      </button>
    </div>
  );
}

// Generate a stable id from heading text
function headingId(text: string): string {
  return `section-${text.replace(/\s+/g, '-')}`;
}

interface TocItem {
  level: 'h2' | 'h3';
  text: string;
  id: string;
}

function parseToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      const text = h2Match[1].trim();
      items.push({ level: 'h2', text, id: headingId(text) });
      continue;
    }
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      const text = h3Match[1].trim();
      items.push({ level: 'h3', text, id: headingId(text) });
    }
  }
  return items;
}

export default function DocumentPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>('');
  const [navOpen, setNavOpen] = useState(true);

  const tocItems = useMemo(() => parseToc(productDocContent), []);

  // Set up IntersectionObserver to watch h2 and h3 elements
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const timer = setTimeout(() => {
      const headings = scrollContainer.querySelectorAll('h2[id^="section-"], h3[id^="section-"]');
      if (headings.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter((e) => e.isIntersecting);
          if (visibleEntries.length > 0) {
            const best = visibleEntries.reduce((a, b) =>
              a.boundingClientRect.top < b.boundingClientRect.top ? a : b
            );
            setActiveId(best.target.id);
          }
        },
        {
          root: scrollContainer,
          rootMargin: '0px 0px -80% 0px',
          threshold: 0,
        }
      );

      headings.forEach((h) => observer.observe(h));

      const handleScroll = () => {
        if (!scrollContainer) return;
        if (scrollContainer.scrollTop < 60) {
          setActiveId('');
        }
      };
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleNavClick = (id: string) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    const el = scrollContainer.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Left Navigation */}
      <nav
        className={`flex-shrink-0 bg-[#F0F0F0] border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          navOpen ? 'w-[220px]' : 'w-0'
        }`}
      >
        <div
          className={`w-[220px] h-full overflow-y-auto py-6 px-3 transition-opacity duration-200 ease-in-out ${
            navOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between px-2 mb-4">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              目录
            </span>
            <button
              onClick={() => setNavOpen(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded px-1 transition-colors duration-150 text-lg"
              title="收起目录"
            >
              ←
            </button>
          </div>
          <ul className="space-y-0.5">
            {tocItems.map((item) => {
              const isActive = activeId === item.id;
              const isH2 = item.level === 'h2';
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      block w-full text-left rounded-md px-2 py-1.5 transition-colors duration-150
                      ${isH2 ? 'text-[13px] font-semibold' : 'text-[12px] pl-5 font-normal'}
                      ${isActive
                        ? 'text-[#FF2442] bg-white font-bold'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      }
                    `}
                    title={item.text}
                  >
                    <span className="line-clamp-2">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Right Document Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          {/* Toggle button when nav is collapsed */}
          {!navOpen && (
            <button
              onClick={() => setNavOpen(true)}
              className="mb-4 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-150"
              title="展开目录"
            >
              ☰ 目录
            </button>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-3 border-b border-gray-200 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => {
                const text = extractText(children);
                const id = headingId(text);
                return (
                  <h2 id={id} className="text-xl font-semibold text-gray-800 mt-10 mb-3">
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = extractText(children);
                const id = headingId(text);
                return (
                  <h3 id={id} className="text-lg font-medium text-gray-800 mt-6 mb-2">
                    {children}
                  </h3>
                );
              },
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-gray-700 mt-5 mb-2">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-sm font-semibold text-gray-700 mt-4 mb-1">
                  {children}
                </h5>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-7 text-gray-700 mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1.5 text-[15px] leading-7 text-gray-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-[15px] leading-7 text-gray-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 bg-gray-50 pl-4 pr-4 py-2 mb-4 text-gray-600 italic rounded-r">
                  {children}
                </blockquote>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes('language-');
                if (isBlock || String(children).includes('\n')) {
                  return (
                    <code className="block bg-[#1E1E1E] rounded-lg p-4 pt-10 text-sm font-mono text-gray-200 overflow-x-auto whitespace-pre leading-6">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <CollapsiblePre>{children}</CollapsiblePre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-100">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-200">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="even:bg-gray-50">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2.5 text-left font-semibold text-gray-700 border-b border-gray-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2.5 text-gray-700">{children}</td>
              ),
              hr: () => <hr className="my-8 border-gray-200" />,
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {productDocContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
