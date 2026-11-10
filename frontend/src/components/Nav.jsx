import { ChevronDown, Moon, PanelLeft, Plus, Sparkles, Sun } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { createConversation } from '../features/createConversation'
import { setMessages } from '../redux/messageSlice'
import { useTheme } from '../context/ThemeContext'

function Nav({ onToggleSidebar, onLoginClick, onOpenBilling }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()

  const handleNewChat = async () => {
    dispatch(setMessages([]))
    const conv = await createConversation()
    if (conv && conv._id) {
      dispatch(setSelectedConversation(conv))
      dispatch(addConversation(conv))
    } else {
      dispatch(setSelectedConversation(null))
    }
  }

  return (
    <header className='h-14 flex items-center justify-between px-4 border-b select-none shrink-0 z-10 transition-colors' style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-header)' }}>
      <div className='flex items-center gap-2'>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            className='icon-pop flex items-center justify-center w-9 h-9 rounded-xl border border-transparent hover:border-purple-400/40 cursor-pointer'
            style={{
              color: theme === 'light' ? '#000000' : '#c084fc',
              backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(168,85,247,0.1)'
            }}
          >
            <PanelLeft size={18} color={theme === 'light' ? '#000000' : '#c084fc'} />
          </button>
        )}

        <button
          onClick={handleNewChat}
          title="New chat"
          className='icon-pop btn-fancy-purple flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer border-none lg:hidden'
        >
          <Plus size={18} color="#FFFFFF" />
        </button>

        <div
          className='icon-pop flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border cursor-pointer group'
          style={{
            backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(168,85,247,0.05)',
            borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(168,85,247,0.2)'
          }}
        >
          <img src="/logo.png" alt="Indus GPT" className='w-10 h-10 object-contain shrink-0 bg-transparent' style={{ background: 'transparent' }} />
          <span className='text-[16px] font-bold tracking-tight' style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}>Indus GPT</span>
          <span
            className='text-[11px] px-1.5 py-0.2 rounded-md ml-0.5'
            style={{
              color: theme === 'light' ? '#000000' : '#d8b4fe',
              backgroundColor: theme === 'light' ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.2)',
              borderColor: theme === 'light' ? 'rgba(168,85,247,0.4)' : 'rgba(192,132,252,0.3)',
              borderWidth: '1px',
              fontWeight: theme === 'light' ? '700' : '500',
              boxShadow: '0 0 10px rgba(168,85,247,0.3)'
            }}
          >
            4o
          </span>
          <ChevronDown size={14} color={theme === 'light' ? '#000000' : '#c084fc'} className='ml-0.5 transition-transform group-hover:translate-y-0.5' />
        </div>

        {selectedConversation && selectedConversation.title !== "New Chat" && (
          <span
            className='hidden md:inline-block text-[13px] max-w-[200px] truncate ml-2 pl-3 border-l'
            style={{
              color: theme === 'light' ? '#000000' : 'rgba(216,180,254,0.8)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            {selectedConversation.title}
          </span>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className='icon-pop flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-colors border'
          style={{
            color: theme === 'dark' ? '#FFFFFF' : '#000000',
            backgroundColor: theme === 'dark' ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.06)',
            borderColor: theme === 'dark' ? 'rgba(168,85,247,0.3)' : 'rgba(0,0,0,0.12)'
          }}
        >
          {theme === 'dark' ? <Sun size={16} color="#FFFFFF" /> : <Moon size={16} color="#000000" />}
        </button>

        {userData ? (
          <>
            <button
              onClick={onOpenBilling}
              className='icon-pop hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12px] font-medium cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              style={{
                color: theme === 'light' ? '#000000' : '#d8b4fe',
                backgroundColor: theme === 'light' ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.1)',
                borderColor: theme === 'light' ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.3)'
              }}
            >
              <Sparkles size={13} color={theme === 'light' ? '#000000' : '#c084fc'} />
              <span style={{ color: theme === 'light' ? '#000000' : '#d8b4fe', fontWeight: theme === 'light' ? '600' : '500' }}>
                {userData.credits ?? 100} credits
              </span>
            </button>

            <div
              onClick={onOpenBilling}
              title={userData.name || "User"}
              className='icon-pop w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center cursor-pointer shadow-[0_0_14px_rgba(168,85,247,0.35)]'
            >
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className='w-full h-full object-cover' />
              ) : (
                <span className='text-xs font-semibold text-white'>
                  {userData.name ? userData.name[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className='btn-fancy-purple flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide cursor-pointer border-none'
          >
            Log in / Sign up
          </button>
        )}
      </div>
    </header>
  )
}

export default Nav
