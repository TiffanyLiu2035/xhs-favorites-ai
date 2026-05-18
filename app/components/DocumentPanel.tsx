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
  displayText: string;
  id: string;
}

// Truncate after " — " or " - " for cleaner TOC display
function tocDisplayText(text: string): string {
  const dash = text.search(/\s[—\-]\s/);
  return dash > 0 ? text.slice(0, dash) : text;
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
      items.push({ level: 'h2', text, displayText: tocDisplayText(text), id: headingId(text) });
      continue;
    }
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      const text = h3Match[1].trim();
      items.push({ level: 'h3', text, displayText: tocDisplayText(text), id: headingId(text) });
    }
  }
  return items;
}

// Animate-on-scroll wrapper
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className || ''}`}
    >
      {children}
    </div>
  );
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
    <div className="flex h-screen bg-[#F7F5F2]">
      {/* Left Navigation */}
      <nav
        className={`flex-shrink-0 bg-[#EDEAE5] border-r border-[#DDD8D0] overflow-hidden transition-all duration-300 ease-in-out ${
          navOpen ? 'w-[220px]' : 'w-0'
        }`}
      >
        <div
          className={`w-[220px] h-full overflow-y-auto py-6 px-3 transition-opacity duration-200 ease-in-out ${
            navOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-between px-2 mb-5">
            <span className="text-xs font-bold text-[#AA8866] uppercase tracking-[0.15em]">
              目录
            </span>
            <button
              onClick={() => setNavOpen(false)}
              className="text-[#AA8866] hover:text-[#664422] hover:bg-[#DDD8D0] rounded px-1.5 py-0.5 transition-colors duration-150 text-sm"
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
                      block w-full text-left rounded-md px-2.5 py-1.5 transition-all duration-200
                      ${isH2 ? 'text-[13px] font-semibold' : 'text-[12px] pl-5 font-normal'}
                      ${isActive
                        ? 'text-[#FF2442] bg-white shadow-sm font-bold'
                        : 'text-[#8A8070] hover:text-[#4A3F35] hover:bg-[#E5E0DA]'
                      }
                    `}
                    title={item.text}
                  >
                    <span className="line-clamp-2">{item.displayText}</span>
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
              className="mb-4 px-4 py-2 text-sm font-bold text-[#8A8070] hover:text-[#4A3F35] bg-[#EDEAE5] hover:bg-[#E5E0DA] rounded-md transition-colors duration-150"
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
                <AnimatedSection>
                  <div className="mt-4 mb-8 first:mt-0">
                    <h1 className="text-[28px] font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                      {children}
                    </h1>
                    <div className="mt-3 h-[3px] w-16 bg-gradient-to-r from-[#FF2442] to-[#FF6B81] rounded-full" />
                  </div>
                </AnimatedSection>
              ),
              h2: ({ children }) => {
                const text = extractText(children);
                const id = headingId(text);
                return (
                  <AnimatedSection>
                    <h2 id={id} className="text-[22px] font-bold text-[#1A1A1A] mt-12 mb-4 pb-2 border-b-2 border-[#FFE0E0]">
                      {children}
                    </h2>
                  </AnimatedSection>
                );
              },
              h3: ({ children }) => {
                const text = extractText(children);
                const id = headingId(text);
                return (
                  <AnimatedSection>
                    <h3 id={id} className="text-[18px] font-semibold text-[#333] mt-8 mb-3 pl-3 border-l-[3px] border-[#FF2442]">
                      {children}
                    </h3>
                  </AnimatedSection>
                );
              },
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-[#444] mt-5 mb-2">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-sm font-semibold text-[#555] mt-4 mb-1">
                  {children}
                </h5>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-7 text-[#444] mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1.5 text-[15px] leading-7 text-[#444]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-[15px] leading-7 text-[#444]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-[#444]">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#FF2442]/30 bg-[#FFF8F8] pl-4 pr-4 py-3 mb-4 text-[#666] italic rounded-r-lg">
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
                  <code className="bg-[#FFF0F0] rounded px-1.5 py-0.5 text-sm font-mono text-[#CC3344]">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <CollapsiblePre>{children}</CollapsiblePre>
              ),
              table: ({ children }) => (
                <AnimatedSection>
                  <div className="overflow-x-auto mb-4 rounded-xl border border-[#E8E4DE] shadow-sm">
                    <table className="min-w-full text-sm">
                      {children}
                    </table>
                  </div>
                </AnimatedSection>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#F5F2ED]">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-[#EBE8E3]">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="even:bg-[#FAFAF8] hover:bg-[#F5F2ED] transition-colors duration-150">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2.5 text-left font-semibold text-[#555] border-b border-[#DDD8D0]">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2.5 text-[#555]">{children}</td>
              ),
              hr: () => (
                <div className="my-10 flex items-center justify-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDD8D0] to-transparent" />
                  <span className="text-[#CCBBAA] text-xs">✦</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDD8D0] to-transparent" />
                </div>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#1A1A1A]">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-[#FF2442] hover:text-[#CC1133] underline underline-offset-2 decoration-[#FF2442]/30 hover:decoration-[#CC1133]/50 transition-colors duration-150" target="_blank" rel="noopener noreferrer">
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
