import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { Code2, FileText, Lightbulb, Presentation } from 'lucide-react'

function MessageList({ onSelectPrompt }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading } = useSelector(state => state.message)
  const bottomRef = useRef(null)

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
    <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#212121]'>
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center my-auto">
          {/* ChatGPT-style Large Centered Logo */}
          <div className='relative mb-5 flex flex-col items-center'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-blue-500/30 p-1 border border-white/10 shadow-2xl flex items-center justify-center'>
              <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' />
            </div>
          </div>

          <h1 className='text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2'>
            What can I help with today?
          </h1>
          <p className='text-sm text-slate-400 max-w-md mb-8 leading-relaxed'>
            Ask me anything — code, reasoning, analysis, documents, or create presentations with Indus GPT.
          </p>

          {/* ChatGPT 2x2 Suggestion Cards - Subtle color change only, no popup/scaling */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left'>
            {suggestions.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={i}
                  onClick={() => onSelectPrompt && onSelectPrompt(`${item.title} ${item.desc}`)}
                  className='p-4 rounded-2xl bg-[#2a2a2a] hover:bg-[#343434] border border-white/[0.06] hover:border-purple-400/30 transition-colors duration-150 cursor-pointer flex flex-col gap-1.5 text-left'
                >
                  <div className='flex items-center gap-2'>
                    <Icon size={16} className={item.color} />
                    <span className='text-[13.5px] font-medium text-slate-100'>{item.title}</span>
                  </div>
                  <span className='text-[12px] text-slate-400 pl-6'>{item.desc}</span>
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
              <div className='w-7 h-7 rounded-full overflow-hidden border border-purple-500/30 bg-[#171717] flex items-center justify-center shrink-0 mt-0.5'>
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
