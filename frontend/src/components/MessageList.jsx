import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { Code2, FileText, Lightbulb, Presentation } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function MessageList({ onSelectPrompt }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading } = useSelector(state => state.message)
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const lastQuestionRef = useRef(null)
  const prevLoadingRef = useRef(isLoading)
  const { theme } = useTheme()

  useEffect(() => {
    // Check if loading just finished (isLoading was true and is now false)
    if (prevLoadingRef.current && !isLoading) {
      if (lastQuestionRef.current) {
        requestAnimationFrame(() => {
          lastQuestionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          })
        })
      }
    } else if (isLoading && !prevLoadingRef.current) {
      // Just started loading - scroll to question so user sees it
      requestAnimationFrame(() => {
        lastQuestionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      })
    }
    prevLoadingRef.current = isLoading
  }, [isLoading])

  const suggestions = [
    {
      icon: Lightbulb,
      title: "Brainstorm ideas",
      desc: "for a new tech startup or product",
      color: "text-amber-400"
    },
    {
      icon: Code2,
      title: "Write clean code",
      desc: "Python, React component, or API",
      color: "text-emerald-400"
    },
    {
      icon: FileText,
      title: "Analyze & summarize",
      desc: "documents, notes, or long articles",
      color: "text-sky-400"
    },
    {
      icon: Presentation,
      title: "Create a presentation",
      desc: "slide outline or pitch deck",
      color: "text-purple-400"
    }
  ]

  return (
    <div ref={containerRef} className='flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-2 sm:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-colors' style={{ backgroundColor: 'var(--bg-main)' }}>
      {messages.length === 0 ? (
        <div className="min-h-full flex flex-col items-center justify-start sm:justify-center max-w-2xl mx-auto px-3 sm:px-4 text-center pt-2 sm:pt-0 pb-4">
          <div className='relative mb-2 sm:mb-4 flex flex-col items-center'>
            <div className='w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-transparent border-none shadow-none' style={{ background: 'transparent' }}>
              <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ background: 'transparent', filter: 'none' }} />
            </div>
          </div>

          <h1 className='text-2xl sm:text-2xl md:text-3xl font-semibold tracking-tight mb-1.5 sm:mb-2' style={{ color: theme === 'light' ? '#000000' : 'var(--text-heading)' }}>
            What can I help with today?
          </h1>
          <p className='text-xs sm:text-sm max-w-md mb-4 sm:mb-8 leading-relaxed' style={{ color: theme === 'light' ? '#334155' : 'var(--text-muted)' }}>
            Ask me anything — code, reasoning, analysis, documents, or create presentations with Indus GPT.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full text-left'>
            {suggestions.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={i}
                  onClick={() => onSelectPrompt && onSelectPrompt(`${item.title} ${item.desc}`)}
                  className='p-4 rounded-2xl border transition-colors duration-150 cursor-pointer flex flex-col gap-1.5 text-left'
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : 'var(--bg-card)',
                    borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'var(--border-subtle)',
                    boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.04)' : undefined
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : 'var(--bg-card-hover)'
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : 'var(--bg-card)'
                    e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'var(--border-subtle)'
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <Icon size={16} className={item.color} />
                    <span className='text-[13.5px] font-medium' style={{ color: theme === 'light' ? '#000000' : 'var(--text-heading)' }}>{item.title}</span>
                  </div>
                  <span className='text-[12px] pl-6' style={{ color: theme === 'light' ? '#475569' : 'var(--text-muted)' }}>{item.desc}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className='max-w-3xl w-full mx-auto space-y-6'>
          {messages.map((msg, i) => {
            const isLastUserMsg = msg.role === 'user' && (i === messages.length - 1 || (i === messages.length - 2 && messages[i + 1]?.role === 'assistant'))
            return (
              <div key={i} ref={isLastUserMsg ? lastQuestionRef : null} className="w-full">
                <MessageBubble
                  role={msg?.role}
                  content={msg?.content}
                  images={msg?.images || []}
                  sources={msg?.sources || []}
                />
              </div>
            )
          })}

          {isLoading && (
            <div className='flex gap-3.5 items-start'>
              <div className='w-11 h-11 flex items-center justify-center shrink-0 mt-0.5 bg-transparent border-none shadow-none' style={{ background: 'transparent' }}>
                <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ background: 'transparent' }} />
              </div>
              <LoadingAnimation />
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
