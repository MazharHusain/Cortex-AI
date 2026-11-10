import React, { useState, useEffect } from 'react'
import { LogOut, MessageSquare, PanelLeft, Plus, Sparkles, SquarePen, User } from "lucide-react"
import { getConversations } from '../features/getConversations'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setConversations, setSelectedConversation } from '../redux/conversationSlice'
import { setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'
import BillingDrawer from './BillingDrawer'

function SideBar({ onLoginClick, collapsed, setCollapsed }) {
    const dispatch = useDispatch()
    const [imageError, setImageError] = useState(false)
    const { conversations, selectedConversation } = useSelector(state => state.conversation)
    const { userData } = useSelector(state => state.user)
    const [showBilling, setShowBilling] = useState(false)

    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations()
            dispatch(setConversations(data || []))
        }
        if (userData?._id) {
            getConv()
        }
    }, [userData?._id])

    const handleCreateConversation = async () => {
        dispatch(setMessages([]))
        const data = await createConversation()
        if (data && data._id) {
            dispatch(addConversation(data))
            dispatch(setSelectedConversation(data))
        } else {
            dispatch(setSelectedConversation(null))
        }
    }

    if (collapsed) {
        return (
            <aside className='hidden lg:flex flex-col items-center w-[58px] h-screen border-r py-3.5 gap-2 shrink-0 select-none z-20 transition-colors' style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-subtle)' }}>
                <button
                    className='icon-pop flex items-center justify-center w-10 h-10 rounded-xl text-purple-400 hover:text-purple-200 hover:bg-purple-600/20 border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                    onClick={() => setCollapsed(false)}
                    title="Open sidebar"
                >
                    <PanelLeft size={19} />
                </button>

                <button
                    className='icon-pop btn-fancy-purple flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer border-none shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    onClick={handleCreateConversation}
                    title="New chat"
                >
                    <SquarePen size={18} />
                </button>

                <div className='flex-1 w-full overflow-y-auto px-2 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2'>
                    {conversations?.map((conv) => {
                        const isActive = selectedConversation?._id === conv?._id
                        return (
                            <button
                                key={conv?._id}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                title={conv?.title || "New Chat"}
                                className={`icon-pop w-full flex items-center justify-center h-10 rounded-xl border transition cursor-pointer ${
                                    isActive
                                        ? "bg-purple-600/25 border-purple-400/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                                        : "bg-transparent border-transparent text-purple-400/60 hover:bg-purple-600/10 hover:text-purple-300 hover:border-purple-500/30"
                                }`}
                            >
                                <MessageSquare size={16} />
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
                            <User size={16} />
                        </button>
                    )}
                </div>

                <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
            </aside>
        )
    }

    return (
        <>
            <aside className='hidden lg:flex flex-col w-[260px] h-screen border-r shrink-0 select-none z-20 transition-colors' style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-subtle)' }}>
                <div className='h-14 flex items-center justify-between px-3.5 border-b' style={{ borderColor: 'var(--border-header)' }}>
                    <div className='flex items-center gap-3'>
                        <img src="/logo.png" alt="Indus GPT" className='w-9 h-9 rounded-xl object-contain shadow-sm' />
                        <span className='font-bold text-[17px] tracking-tight' style={{ color: 'var(--text-heading)' }}>Indus GPT</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <button
                            onClick={handleCreateConversation}
                            title="New chat"
                            className='icon-pop flex items-center justify-center w-8 h-8 rounded-lg text-purple-400 hover:text-purple-200 hover:bg-purple-600/20 border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                        >
                            <SquarePen size={18} />
                        </button>
                        <button
                            onClick={() => setCollapsed(true)}
                            title="Close sidebar"
                            className='icon-pop flex items-center justify-center w-8 h-8 rounded-lg text-purple-400 hover:text-purple-200 hover:bg-purple-600/20 border border-transparent hover:border-purple-400/40 cursor-pointer bg-transparent'
                        >
                            <PanelLeft size={18} />
                        </button>
                    </div>
                </div>

                <div className='px-3 pt-3'>
                    <button
                        onClick={handleCreateConversation}
                        className='icon-pop btn-fancy-purple w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold cursor-pointer border-none shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                    >
                        <Plus size={17} strokeWidth={2.4} />
                        <span>New chat</span>
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto px-3 py-3 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='text-[11px] font-semibold text-purple-400/70 uppercase tracking-wider px-2 py-1'>
                        Recent chats
                    </div>

                    {conversations && conversations.length > 0 ? (
                        conversations.map((conv) => {
                            const isActive = selectedConversation?._id === conv?._id
                            return (
                                <div
                                    key={conv?._id}
                                    onClick={() => dispatch(setSelectedConversation(conv))}
                                    className={`icon-pop group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border transition-all duration-150 ${
                                        isActive
                                            ? "bg-purple-600/25 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                                            : "border-transparent hover:bg-purple-600/10 hover:border-purple-500/30"
                                    }`}
                                    style={{ color: isActive ? 'var(--text-heading)' : 'var(--text-main)' }}
                                >
                                    <MessageSquare size={15} className={`shrink-0 ${isActive ? "text-purple-300" : "text-purple-400/60 group-hover:text-purple-300"}`} />
                                    <span className='truncate flex-1'>{conv?.title || "New Chat"}</span>
                                </div>
                            )
                        })
                    ) : (
                        <p className='text-xs px-3 py-4 text-center' style={{ color: 'var(--text-muted)' }}>No chats yet. Start a new conversation!</p>
                    )}
                </div>

                <div className='p-3 border-t space-y-2' style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-sidebar)' }}>
                    {userData ? (
                        <>
                            <button
                                onClick={() => setShowBilling(true)}
                                className='icon-pop w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:border-purple-400/60 text-xs font-semibold text-purple-300 transition cursor-pointer shadow-[0_0_14px_rgba(168,85,247,0.2)]'
                            >
                                <div className='flex items-center gap-2'>
                                    <Sparkles size={14} className='text-purple-400' />
                                    <span>Upgrade Plan</span>
                                </div>
                                <span className='text-[11px] bg-purple-500/30 border border-purple-400/30 px-2 py-0.5 rounded-full text-purple-300'>
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
                                        <p className='text-xs font-semibold truncate' style={{ color: 'var(--text-heading)' }}>{userData.name || "User"}</p>
                                        <p className='text-[10px] text-purple-400 capitalize'>{userData.plan || "Free plan"}</p>
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
            </aside>

            <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
        </>
    )
}

export default SideBar
