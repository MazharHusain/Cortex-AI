import React, { useState, useEffect } from 'react'
import { LogOut, MessageSquare, PanelLeft, Plus, Sparkles, SquarePen, User, X } from "lucide-react"
import { getConversations } from '../features/getConversations'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setConversations, setSelectedConversation } from '../redux/conversationSlice'
import { setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'
import BillingDrawer from './BillingDrawer'
import { useTheme } from '../context/ThemeContext'

function SideBar({ onLoginClick, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const dispatch = useDispatch()
    const [imageError, setImageError] = useState(false)
    const { conversations, selectedConversation } = useSelector(state => state.conversation)
    const { userData } = useSelector(state => state.user)
    const [showBilling, setShowBilling] = useState(false)
    const { messages } = useSelector(state => state.message)
    const { theme } = useTheme()

    useEffect(() => {
        setImageError(false)
    }, [userData?.avatar])

    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations()
            // Gemini/ChatGPT style: don't show empty "New Chat" in recent list
            const valid = (data || []).filter(c => c && c.title && c.title !== "New Chat")
            dispatch(setConversations(valid))
        }
        if (userData?._id) {
            getConv()
        }
    }, [userData?._id])

    const handleCreateConversation = async () => {
        // If current window is already a fresh new chat with no messages, don't create duplicate
        if (!selectedConversation || messages.length === 0 || selectedConversation.title === "New Chat") {
            dispatch(setMessages([]))
            dispatch(setSelectedConversation(null))
            if (setMobileOpen) setMobileOpen(false)
            return
        }
        dispatch(setMessages([]))
        dispatch(setSelectedConversation(null))
        if (setMobileOpen) setMobileOpen(false)
    }

    const handleSelectConv = (conv) => {
        dispatch(setSelectedConversation(conv))
        if (setMobileOpen) setMobileOpen(false)
    }

    const sidebarContent = (showCloseBtn = false) => (
        <div className='flex flex-col h-full'>
            <div className='h-14 flex items-center justify-between px-3.5 border-b shrink-0' style={{ borderColor: 'var(--border-header)' }}>
                <div className='flex items-center gap-3'>
                    <img src="/logo.png" alt="Indus GPT" className='w-9 h-9 object-contain bg-transparent' style={{ background: 'transparent' }} />
                    <span className='font-bold text-[17px] tracking-tight' style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}>Indus GPT</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    <button
                        onClick={handleCreateConversation}
                        title="New chat"
                        className='icon-pop flex items-center justify-center w-8 h-8 rounded-lg border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                        style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                    >
                        <SquarePen size={18} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                    </button>
                    {showCloseBtn ? (
                        <button
                            onClick={() => setMobileOpen(false)}
                            title="Close menu"
                            className='icon-pop flex items-center justify-center w-8 h-8 rounded-lg border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                            style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                        >
                            <X size={18} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCollapsed(true)}
                            title="Close sidebar"
                            className='icon-pop flex items-center justify-center w-8 h-8 rounded-lg border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                            style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                        >
                            <PanelLeft size={18} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                        </button>
                    )}
                </div>
            </div>

            <div className='px-3 pt-3 shrink-0'>
                <button
                    onClick={handleCreateConversation}
                    className='icon-pop btn-fancy-purple w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer border-none shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                >
                    <Plus size={17} strokeWidth={2.4} color="#FFFFFF" />
                    <span>New chat</span>
                </button>
            </div>

            <div className='flex-1 overflow-y-auto px-3 py-3 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                <div
                    className='text-[11px] font-bold uppercase tracking-wider px-2 py-1'
                    style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                >
                    Recent chats
                </div>

                {conversations && conversations.length > 0 ? (
                    conversations.map((conv) => {
                        const isActive = selectedConversation?._id === conv?._id
                        return (
                            <div
                                key={conv?._id}
                                onClick={() => handleSelectConv(conv)}
                                className={`icon-pop group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border transition-all duration-150 ${
                                    isActive
                                        ? "bg-purple-600/25 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                                        : "border-transparent hover:bg-purple-600/10 hover:border-purple-500/30"
                                }`}
                                style={{
                                    color: isActive
                                        ? (theme === 'light' ? '#000000' : '#FFFFFF')
                                        : (theme === 'light' ? '#000000' : '#e2e8f0'),
                                    fontWeight: isActive ? '600' : '500'
                                }}
                            >
                                <MessageSquare
                                    size={15}
                                    className='shrink-0'
                                    color={isActive ? (theme === 'light' ? '#000000' : '#d8b4fe') : (theme === 'light' ? '#000000' : '#c084fc')}
                                />
                                <span className='truncate flex-1'>{conv?.title || "New Chat"}</span>
                            </div>
                        )
                    })
                ) : (
                    <p className='text-xs px-3 py-4 text-center' style={{ color: theme === 'light' ? '#000000' : 'var(--text-muted)' }}>
                        No chats yet. Start a new conversation!
                    </p>
                )}
            </div>

            <div className='p-3 border-t space-y-2 shrink-0' style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-sidebar)' }}>
                {userData ? (
                    <>
                        <button
                            onClick={() => setShowBilling(true)}
                            className='icon-pop w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:border-purple-400/60 text-xs font-semibold transition cursor-pointer shadow-[0_0_14px_rgba(168,85,247,0.2)]'
                            style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                        >
                            <div className='flex items-center gap-2'>
                                <Sparkles size={14} color={theme === 'light' ? '#000000' : '#c084fc'} />
                                <span style={{ color: theme === 'light' ? '#000000' : '#FFFFFF', fontWeight: theme === 'light' ? '700' : '600' }}>
                                    Upgrade Plan
                                </span>
                            </div>
                            <span
                                className='text-[11px] bg-purple-500/30 border border-purple-400/30 px-2 py-0.5 rounded-full'
                                style={{
                                    color: theme === 'light' ? '#000000' : '#FFFFFF',
                                    fontWeight: theme === 'light' ? '700' : '500'
                                }}
                            >
                                {userData.credits ?? 100} credits
                            </span>
                        </button>

                        <div className='flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-purple-600/10 hover:border hover:border-purple-500/20 transition'>
                            <div
                                onClick={() => setShowBilling(true)}
                                className='flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer'
                            >
                                <div className='w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]'>
                                    {userData.avatar && !imageError ? (
                                        <img src={userData.avatar} alt="user" className='w-full h-full object-cover' onError={() => setImageError(true)} />
                                    ) : (
                                        <User size={15} className='text-white' />
                                    )}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <p className='text-xs font-semibold truncate' style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}>{userData.name || "User"}</p>
                                    <p className='text-[10px] capitalize' style={{ color: theme === 'light' ? '#000000' : '#c084fc' }}>{userData.plan || "Free plan"}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    logOut()
                                    dispatch(setUserdata(null))
                                }}
                                title="Log out"
                                className='icon-pop p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition cursor-pointer border-none bg-transparent'
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className='p-1'>
                        <button
                            onClick={onLoginClick}
                            className='icon-pop btn-fancy-purple w-full flex items-center justify-center gap-2 text-xs font-semibold py-3 rounded-2xl cursor-pointer border-none shadow-[0_0_20px_rgba(168,85,247,0.45)]'
                        >
                            <Sparkles size={14} className='text-purple-200' />
                            <span>Log in or Sign up</span>
                        </button>
                    </div>
                )}
            </div>

            <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
        </div>
    )

    if (collapsed) {
        return (
            <>
                <aside className='hidden lg:flex flex-col items-center w-[58px] h-screen border-r py-3.5 gap-2 shrink-0 select-none z-20 transition-colors' style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-subtle)' }}>
                    <button
                        className='icon-pop flex items-center justify-center w-10 h-10 rounded-xl border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                        onClick={() => setCollapsed(false)}
                        title="Open sidebar"
                        style={{ color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                    >
                        <PanelLeft size={19} color={theme === 'light' ? '#000000' : '#FFFFFF'} />
                    </button>

                    <button
                        className='icon-pop btn-fancy-purple flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer border-none shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        onClick={handleCreateConversation}
                        title="New chat"
                    >
                        <SquarePen size={18} color="#FFFFFF" />
                    </button>

                    <div className='flex-1 w-full overflow-y-auto px-2 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2'>
                        {conversations?.map((conv) => {
                            const isActive = selectedConversation?._id === conv?._id
                            return (
                                <button
                                    key={conv?._id}
                                    onClick={() => handleSelectConv(conv)}
                                    title={conv?.title || "New Chat"}
                                    className={`icon-pop w-full flex items-center justify-center h-10 rounded-xl border transition cursor-pointer ${
                                        isActive
                                            ? "bg-purple-600/25 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                                            : "bg-transparent border-transparent hover:bg-purple-600/10 hover:border-purple-500/30"
                                    }`}
                                    style={{
                                        color: isActive
                                            ? (theme === 'light' ? '#000000' : '#d8b4fe')
                                            : (theme === 'light' ? '#000000' : '#c084fc')
                                    }}
                                >
                                    <MessageSquare size={16} color={isActive ? (theme === 'light' ? '#000000' : '#d8b4fe') : (theme === 'light' ? '#000000' : '#c084fc')} />
                                </button>
                            )
                        })}
                    </div>

                    <div className='pt-2 border-t w-full flex justify-center' style={{ borderColor: 'var(--border-subtle)' }}>
                        {userData ? (
                            <button
                                onClick={() => setShowBilling(true)}
                                title={userData.name}
                                className='icon-pop w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                            >
                                {userData.avatar && !imageError ? (
                                    <img src={userData.avatar} alt="user" className='w-full h-full object-cover' onError={() => setImageError(true)} />
                                ) : (
                                    <User size={16} className='text-white' />
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                title="Log in"
                                className='icon-pop btn-fancy-purple w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none'
                            >
                                <User size={16} color="#FFFFFF" />
                            </button>
                        )}
                    </div>

                    <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
                </aside>

                {mobileOpen && (
                    <>
                        <div
                            className='fixed inset-0 bg-black/60 z-40 lg:hidden'
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside
                            className='fixed left-0 top-0 h-full w-[280px] z-50 flex flex-col lg:hidden select-none transition-colors'
                            style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
                        >
                            {sidebarContent(true)}
                        </aside>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            <aside className='hidden lg:flex flex-col w-[260px] h-screen border-r shrink-0 select-none z-20 transition-colors' style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-subtle)' }}>
                {sidebarContent(false)}
            </aside>

            {mobileOpen && (
                <>
                    <div
                        className='fixed inset-0 bg-black/60 z-40 lg:hidden'
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside
                        className='fixed left-0 top-0 h-full w-[280px] z-50 flex flex-col lg:hidden select-none transition-colors'
                        style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
                    >
                        {sidebarContent(true)}
                    </aside>
                </>
            )}
        </>
    )
}

export default SideBar
