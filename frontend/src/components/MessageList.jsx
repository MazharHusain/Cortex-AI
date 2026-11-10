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
  const { theme } = useTheme()

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      })
    })
  }, [messages?.length, isLoading])

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
    <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-colors' style={{ backgroundColor: 'var(--bg-main)' }}>
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center my-auto">
          <div className='relative mb-5 flex flex-col items-center'>
            <div
              className='w-20 h-20 rounded-2xl p-2.5 border shadow-2xl flex items-center justify-center transition-all'
              style={{
                backgroundColor: '#ffffff',
                borderColor: theme === 'dark' ? 'rgba(192, 132, 252, 0.5)' : 'rgba(192, 132, 252, 0.3)',
                boxShadow: theme === 'dark' ? '0 0 30px rgba(192, 132, 252, 0.45)' : '0 10px 25px rgba(0, 0, 0, 0.08)'
              }}
            >
              <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ filter: 'none', opacity: 1 }} />
            </div>
          </div>

          <h1 className='text-2xl md:text-3xl font-semibold tracking-tight mb-2' style={{ color: theme === 'light' ? '#000000' : 'var(--text-heading)' }}>
            What can I help with today?
          </h1>
          <p className='text-sm max-w-md mb-8 leading-relaxed' style={{ color: theme === 'light' ? '#334155' : 'var(--text-muted)' }}>
            Ask me anything — code, reasoning, analysis, documents, or create presentations with Indus GPT.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left'>
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
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg?.role}
              content={msg?.content}
              images={msg?.images || []}
            />
          ))}

          {isLoading && (
            <div className='flex gap-3.5 items-start'>
              <div className='w-8 h-8 rounded-full overflow-hidden border border-purple-500/30 bg-[#171717] flex items-center justify-center shrink-0 mt-0.5'>
                <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' />
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
