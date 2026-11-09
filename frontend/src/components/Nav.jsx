import { ChevronDown, MessageSquare, PanelLeft, Plus, Sparkles, User } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setSelectedConversation } from '../redux/conversationSlice'
import { createConversation } from '../features/createConversation'
import { setMessages } from '../redux/messageSlice'

function Nav({ onToggleSidebar, onLoginClick, onOpenBilling }) {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()

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
    <header className='h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#212121] select-none shrink-0 z-10'>
      {/* Left: Sidebar Toggle & Model Selector */}
      <div className='flex items-center gap-2'>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            className='flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 cursor-pointer border-none bg-transparent'
          >
            <PanelLeft size={18} />
          </button>
        )}

        <button
          onClick={handleNewChat}
          title="New chat"
          className='flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 cursor-pointer border-none bg-transparent lg:hidden'
        >
          <Plus size={18} />
        </button>

        {/* ChatGPT-style Model Pill */}
        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors text-slate-200 group'>
          <img src="/logo.png" alt="Indus GPT" className='w-5 h-5 rounded-md object-contain' />
          <span className='text-[15px] font-semibold tracking-tight text-white'>Indus GPT</span>
          <span className='text-[11px] font-medium text-purple-400 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.2 rounded-md ml-1'>4o</span>
          <ChevronDown size={14} className='text-slate-500 group-hover:text-slate-300 ml-0.5 transition-transform' />
        </div>

        {selectedConversation && selectedConversation.title !== "New Chat" && (
          <span className='hidden md:inline-block text-[13px] text-slate-400 max-w-[200px] truncate ml-2 pl-3 border-l border-white/10'>
            {selectedConversation.title}
          </span>
        )}
      </div>

      {/* Right: Plan/Credits & Profile/Login */}
      <div className='flex items-center gap-2'>
        {userData ? (
          <>
            <button
              onClick={onOpenBilling}
              className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[12px] font-medium text-slate-300 transition cursor-pointer'
            >
              <Sparkles size={13} className='text-amber-400' />
              <span>{userData.credits ?? 100} credits</span>
            </button>

            <div
              onClick={onOpenBilling}
              title={userData.name || "User"}
              className='w-8 h-8 rounded-full overflow-hidden bg-purple-600/30 border border-purple-500/40 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500/40 transition'
            >
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className='w-full h-full object-cover' />
              ) : (
                <span className='text-xs font-semibold text-purple-200'>
                  {userData.name ? userData.name[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className='flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold tracking-wide transition cursor-pointer shadow-sm'
          >
            Log in
          </button>
        )}
      </div>
    </header>
  )
}

export default Nav
