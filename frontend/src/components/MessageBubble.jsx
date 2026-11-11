import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Globe, X } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../context/ThemeContext'

function MessageBubble({ role, content, images, sources }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState("")
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false)
  const { theme } = useTheme()

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode("")
    }, 2000)
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(content || "")
    setCopiedMessage(true)
    setTimeout(() => {
      setCopiedMessage(false)
    }, 2000)
  }

  const normalizedSources = useMemo(() => {
    if (!sources || !Array.isArray(sources) || sources.length === 0) return []
    return sources.map((s, idx) => {
      if (typeof s === "string") {
        let domain = ""
        try {
          domain = new URL(s).hostname.replace(/^www\./, '')
        } catch (e) {
          domain = "source"
        }
        return {
          id: idx + 1,
          title: domain,
          url: s,
          domain,
          siteName: domain.split('.')[0] ? (domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)) : "Source",
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          snippet: ""
        }
      }
      let domain = s.domain
      if (!domain && s.url) {
        try {
          domain = new URL(s.url).hostname.replace(/^www\./, '')
        } catch (e) {
          domain = "source"
        }
      }
      return {
        id: s.id || idx + 1,
        title: s.title || domain || "Source",
        url: s.url,
        domain: domain || "source",
        siteName: s.siteName || (domain ? (domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)) : "Source"),
        favicon: s.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        snippet: s.snippet || ""
      }
    }).filter(s => s.url)
  }, [sources])

  const cleanContent = useMemo(() => {
    if (!content) return ""
    return content
      .replace(/(?:#{1,6}\s*)?\**Optimized Code(?:\s*\(if needed\))?\**[:\s]*[\s\S]*?(?=(?:#{1,6}\s|\n\n[A-Z]|$))/gi, "")
      .replace(/Optimized Code[\s\S]*$/gi, "")
      .trim()
  }, [content])

  const processedContent = useMemo(() => {
    let text = cleanContent
    if (normalizedSources.length > 0) {
      text = text.replace(/\[(\d+)\]/g, (match, numStr) => {
        const idx = parseInt(numStr, 10)
        const src = normalizedSources.find(s => s.id === idx) || normalizedSources[idx - 1]
        if (src && src.url) {
          return `[cite:${idx}](${src.url})`
        }
        return match
      })
    }
    return text
  }, [cleanContent, normalizedSources])

  if (isUser) {
    return (
      <div className='flex justify-end w-full'>
        <div
          className='max-w-[85%] md:max-w-[70%] border px-5 py-3 rounded-[24px] rounded-br-md text-[15px] leading-relaxed break-words shadow-[0_0_16px_rgba(168,85,247,0.35)] transition-colors'
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 50%, #6366f1 100%)',
            borderColor: 'rgba(168, 85, 247, 0.4)',
            color: '#FFFFFF'
          }}
        >
          {images && images.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-2'>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setLightBox(img)}
                  loading="lazy"
                  alt="Upload"
                  className="w-36 h-24 rounded-xl object-cover border border-white/20 cursor-zoom-in hover:opacity-90 transition"
                />
              ))}
            </div>
          )}
          <p
            className='whitespace-pre-wrap font-medium tracking-wide text-white'
            style={{ color: '#FFFFFF' }}
          >
            {content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex gap-3.5 w-full justify-start items-start group'>
      <div className='w-11 h-11 flex items-center justify-center shrink-0 mt-0.5 bg-transparent border-none shadow-none' style={{ background: 'transparent' }}>
        <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ background: 'transparent' }} />
      </div>

      <div className='flex-1 min-w-0 text-[15px] leading-relaxed break-words space-y-2' style={{ color: 'var(--text-main)' }}>
        {images && images.length > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 my-3' style={{maxWidth:'480px'}}>
            {images.map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl border border-purple-400/25 shadow-sm bg-transparent cursor-zoom-in hover:opacity-95 hover:border-purple-400/50 transition"
                style={{aspectRatio:'1/1'}}
                onClick={() => setLightBox(img)}
              >
                <img
                  src={img}
                  loading="lazy"
                  alt="Search result"
                  onError={(e) => {
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.style.display = 'none'
                    }
                  }}
                  className="w-full h-full object-cover rounded-xl block"
                />
              </div>
            ))}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className='text-2xl font-bold mt-4 mb-2' style={{ color: 'var(--text-heading)' }}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-xl font-semibold mt-3 mb-2' style={{ color: 'var(--text-heading)' }}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-lg font-semibold mt-2.5 mb-1.5' style={{ color: 'var(--text-heading)' }}>{children}</h3>
            ),
            p: ({ children }) => (
              <p className='mb-3 whitespace-pre-wrap break-words leading-7'>{children}</p>
            ),
            ul: ({ children }) => (
              <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>
            ),
            table: ({ children }) => (
              <div className='overflow-x-auto my-4 rounded-xl border' style={{ borderColor: 'var(--border-subtle)' }}>
                <table className='min-w-full text-sm divide-y' style={{ borderColor: 'var(--border-subtle)' }}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className='bg-purple-500/10 px-3.5 py-2 text-left font-semibold' style={{ color: 'var(--text-heading)' }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className='px-3.5 py-2 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
                {children}
              </td>
            ),
            a: ({ href, children }) => {
              const rawChildren = Array.isArray(children) ? children.join("") : String(children || "")
              if (rawChildren.startsWith("cite:")) {
                const citeId = parseInt(rawChildren.replace("cite:", ""), 10)
                const citeSource = normalizedSources.find(s => s.id === citeId) || normalizedSources[citeId - 1]
                const citeDomain = citeSource?.domain || "source"
                const citeFavicon = citeSource?.favicon || `https://www.google.com/s2/favicons?domain=${citeDomain}&sz=32`
                const citeName = citeSource?.siteName || citeDomain

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={citeSource?.title || citeDomain}
                    className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-medium align-baseline transition-all duration-150 no-underline hover:scale-105 select-none"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(147, 51, 234, 0.1)',
                      borderColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(147, 51, 234, 0.28)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      color: theme === 'dark' ? '#f3e8ff' : '#6b21a8'
                    }}
                  >
                    <img
                      src={citeFavicon}
                      alt=""
                      className="w-3 h-3 rounded-full object-contain shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="truncate max-w-[80px]">{citeName}</span>
                    <ExternalLink size={9} className="opacity-70 shrink-0" />
                  </a>
                )
              }

              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 transition"
                >
                  {children}
                  <ExternalLink size={13} />
                </a>
              )
            },
            code: ({ className, children }) => {
              const value = String(children).trim()
              if (!className) {
                return (
                  <code className='px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[13px] font-mono'>
                    {value}
                  </code>
                )
              }

              const language = className.replace("language-", "")

              return (
                <div className='my-4 overflow-hidden rounded-xl border border-white/10 bg-[#171717] shadow-lg'>
                  <div className='flex items-center justify-between bg-[#212121] border-b border-white/10 px-4 py-2 select-none'>
                    <span className='uppercase text-xs font-mono font-medium text-slate-400'>
                      {language || "code"}
                    </span>
                    <button
                      className='flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer border-none bg-transparent'
                      onClick={() => copyCode(value)}
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={13} className='text-emerald-400' />
                          <span className='text-emerald-400'>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#171717",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              )
            },
            img: ({ src }) => {
              if (!src) return null
              return (
                <div className="my-2 overflow-hidden rounded-xl border border-purple-400/20 max-w-[200px] bg-black/10 dark:bg-black/30">
                  <img
                    src={src}
                    onClick={() => setLightBox(src)}
                    loading="lazy"
                    alt="Embedded"
                    onError={(e) => {
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.style.display = 'none'
                      }
                    }}
                    className="max-h-36 max-w-full w-auto h-auto object-contain rounded-xl cursor-zoom-in hover:opacity-90 transition block mx-auto"
                  />
                </div>
              )
            }
          }}
        >
          {processedContent}
        </Markdown>

        {normalizedSources.length > 0 && (
          <div className='pt-2 select-none'>
            <button
              type="button"
              onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border'
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(147, 51, 234, 0.08)',
                borderColor: isSourcesExpanded
                  ? (theme === 'dark' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(147, 51, 234, 0.4)')
                  : (theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'),
                color: theme === 'dark' ? '#f3e8ff' : '#111827'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(168, 85, 247, 0.22)' : 'rgba(147, 51, 234, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(147, 51, 234, 0.08)'
                e.currentTarget.style.borderColor = isSourcesExpanded
                  ? (theme === 'dark' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(147, 51, 234, 0.4)')
                  : (theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)')
              }}
            >
              <Globe size={13} className={theme === 'dark' ? 'text-purple-300' : 'text-purple-600'} />
              <span>{normalizedSources.length} sources</span>
              {isSourcesExpanded ? (
                <ChevronUp size={14} className="opacity-70 transition-transform" />
              ) : (
                <ChevronDown size={14} className="opacity-70 transition-transform" />
              )}
            </button>

            {isSourcesExpanded && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3'>
                {normalizedSources.map((src, idx) => {
                  const domain = src.domain || "source"
                  const favicon = src.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
                  const siteName = src.siteName || domain

                  return (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className='flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 no-underline group/card'
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        boxShadow: theme === 'dark' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(168, 85, 247, 0.08)' : '#faf5ff'
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'
                        e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div>
                        <div className='flex items-center gap-2 mb-1.5'>
                          <div className='w-4 h-4 rounded-full overflow-hidden bg-white/10 shrink-0 flex items-center justify-center'>
                            <img
                              src={favicon}
                              alt=""
                              className='w-3.5 h-3.5 object-contain'
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          </div>
                          <span
                            className='text-xs font-medium truncate'
                            style={{ color: theme === 'dark' ? '#d8b4fe' : '#7e22ce' }}
                          >
                            {siteName}
                          </span>
                          <ExternalLink size={11} className='ml-auto opacity-50 group-hover/card:opacity-100 group-hover/card:text-purple-400 transition-opacity shrink-0' />
                        </div>

                        <h4
                          className='text-[13px] font-semibold line-clamp-2 leading-snug transition-colors'
                          style={{ color: theme === 'dark' ? '#FFFFFF' : '#111827' }}
                        >
                          {src.title || domain}
                        </h4>

                        {src.snippet && (
                          <p
                            className='text-[12px] line-clamp-2 mt-1 leading-relaxed'
                            style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#4b5563' }}
                          >
                            {src.snippet}
                          </p>
                        )}
                      </div>

                      <div
                        className='pt-2 mt-2 border-t flex items-center justify-between text-[11px]'
                        style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                      >
                        <span className='truncate opacity-60 font-mono' style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                          {domain}
                        </span>
                        <span
                          className='text-[10px] font-medium px-1.5 py-0.5 rounded'
                          style={{
                            backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(147, 51, 234, 0.08)',
                            color: theme === 'dark' ? '#c084fc' : '#9333ea'
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className='flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            onClick={copyMessage}
            title="Copy response"
            className='icon-pop p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/20 border border-transparent hover:border-purple-400/40 transition cursor-pointer bg-transparent'
          >
            {copiedMessage ? <Check size={14} className='text-emerald-400' /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {lightBox && (
        <div className='fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6'>
          <button
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2 cursor-pointer border-none'
            onClick={() => setLightBox(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightBox}
            alt="Expanded view"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default MessageBubble
