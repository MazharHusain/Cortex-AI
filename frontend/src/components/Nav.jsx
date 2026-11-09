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
      {/* Left: Sidebar Toggle, New Chat, & Model Selector */}
      <div className='flex items-center gap-2'>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            className='icon-pop flex items-center justify-center w-9 h-9 rounded-xl text-purple-300 hover:text-white bg-white/[0.04] hover:bg-purple-600/20 border border-transparent hover:border-purple-400/40 cursor-pointer'
          >
            <PanelLeft size={18} />
          </button>
        )}

        <button
          onClick={handleNewChat}
          title="New chat"
          className='icon-pop btn-fancy-purple flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer border-none lg:hidden'
        >
          <Plus size={18} />
        </button>

        {/* ChatGPT-style Model Pill with Purple Pop */}
        <div className='icon-pop flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.03] hover:bg-purple-600/15 border border-white/[0.06] hover:border-purple-400/40 cursor-pointer text-slate-200 group'>
          <img src="/logo.png" alt="Indus GPT" className='w-5 h-5 rounded-md object-contain' />
          <span className='text-[15px] font-semibold tracking-tight text-white'>Indus GPT</span>
          <span className='text-[11px] font-medium text-purple-300 bg-purple-500/20 border border-purple-400/30 px-1.5 py-0.2 rounded-md ml-0.5 shadow-[0_0_10px_rgba(168,85,247,0.3)]'>
            4o
          </span>
          <ChevronDown size={14} className='text-purple-400 group-hover:text-purple-200 ml-0.5 transition-transform group-hover:translate-y-0.5' />
        </div>

        {selectedConversation && selectedConversation.title !== "New Chat" && (
          <span className='hidden md:inline-block text-[13px] text-purple-200/70 max-w-[200px] truncate ml-2 pl-3 border-l border-white/10'>
            {selectedConversation.title}
          </span>
        )}
      </div>

      {/* Right: Plan/Credits & Fancy Purple Login Button */}
      <div className='flex items-center gap-2.5'>
        {userData ? (
          <>
            <button
              onClick={onOpenBilling}
              className='icon-pop hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/60 text-[12px] font-medium text-purple-200 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.2)]'
            >
              <Sparkles size={13} className='text-purple-400' />
              <span>{userData.credits ?? 100} credits</span>
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
