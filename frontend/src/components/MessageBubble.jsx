import { Check, Copy, ExternalLink, X } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageBubble({ role, content, images }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState("")
  const [copiedMessage, setCopiedMessage] = useState(false)

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

  if (isUser) {
    return (
      <div className='flex justify-end w-full'>
        <div className='max-w-[85%] md:max-w-[70%] bg-[#2f2f2f] text-[#ececec] px-5 py-3 rounded-[24px] rounded-br-md text-[15px] leading-relaxed break-words shadow-sm'>
          {images && images.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-2'>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setLightBox(img)}
                  loading="lazy"
                  alt="Upload"
                  className="w-36 h-24 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              ))}
            </div>
          )}
          <p className='whitespace-pre-wrap'>{content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex gap-3.5 w-full justify-start items-start group'>
      <div className='w-8 h-8 rounded-full overflow-hidden border border-purple-500/30 bg-[#171717] flex items-center justify-center shrink-0 mt-0.5 shadow-sm'>
        <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' />
      </div>

      <div className='flex-1 min-w-0 text-[#ececec] text-[15px] leading-relaxed break-words space-y-2'>
        {images && images.length > 0 && (
          <div className='flex flex-wrap gap-3 my-3'>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setLightBox(img)}
                loading="lazy"
                alt="AI Generated"
                onError={(e) => e.currentTarget.remove()}
                className="w-48 h-32 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-95 transition shadow-md"
              />
            ))}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className='text-2xl font-bold mt-4 mb-2 text-white'>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className='text-xl font-semibold mt-3 mb-2 text-white'>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-lg font-semibold mt-2.5 mb-1.5 text-white'>{children}</h3>
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
              <div className='overflow-x-auto my-4 rounded-xl border border-white/10'>
                <table className='min-w-full text-sm divide-y divide-white/10'>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className='bg-white/[0.06] px-3.5 py-2 text-left font-semibold text-white'>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className='px-3.5 py-2 border-t border-white/[0.06] text-slate-300'>
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 transition"
              >
                {children}
                <ExternalLink size={13} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).trim()
              if (!className) {
                return (
                  <code className='px-1.5 py-0.5 rounded-md bg-white/[0.08] text-purple-200 text-[13px] font-mono'>
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
                <img
                  src={src}
                  onClick={() => setLightBox(src)}
                  loading="lazy"
                  alt="Embedded"
                  onError={(e) => e.currentTarget.remove()}
                  className="w-48 h-32 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition my-2"
                />
              )
            }
          }}
        >
          {content}
        </Markdown>

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
