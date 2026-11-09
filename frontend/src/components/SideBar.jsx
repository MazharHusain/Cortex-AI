import React, { useState, useEffect } from 'react'
import { Coins, LogOut, MessageSquare, PanelLeft, Plus, Sparkles, SquarePen, Trash2, User, X } from "lucide-react"
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

    // Collapsed Sidebar View (ChatGPT Icon Bar)
    if (collapsed) {
        return (
            <aside className='hidden lg:flex flex-col items-center w-[58px] h-screen bg-[#171717] border-r border-white/[0.08] py-3.5 gap-2 shrink-0 select-none z-20'>
                <button
                    className='flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 bg-transparent border-none cursor-pointer'
                    onClick={() => setCollapsed(false)}
                    title="Open sidebar"
                >
                    <PanelLeft size={19} />
                </button>

                <button
                    className='flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors duration-150 bg-transparent border-none cursor-pointer'
                    onClick={handleCreateConversation}
                    title="New chat"
                >
                    <SquarePen size={18} />
                </button>

                <div className='flex-1 w-full overflow-y-auto px-2 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2'>
                    {conversations?.map((conv) => {
                        const isActive = selectedConversation?._id === conv?._id
                        return (
                            <button
                                key={conv?._id}
                                onClick={() => dispatch(setSelectedConversation(conv))}
                                title={conv?.title || "New Chat"}
                                className={`w-full flex items-center justify-center h-10 rounded-xl transition cursor-pointer border-none ${
                                    isActive ? "bg-[#212121] text-white" : "bg-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                                }`}
                            >
                                <MessageSquare size={16} />
                            </button>
                        )
                    })}
                </div>

                {/* Bottom user avatar */}
                <div className='pt-2 border-t border-white/[0.08] w-full flex justify-center'>
                    {userData ? (
                        <button
                            onClick={() => setShowBilling(true)}
                            title={userData.name}
                            className='w-9 h-9 rounded-full overflow-hidden bg-purple-600/30 border border-purple-500/40 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-400 transition'
                        >
                            {userData.avatar && !imageError ? (
                                <img src={userData.avatar} alt="user" className='w-full h-full object-cover' onError={() => setImageError(true)} />
                            ) : (
                                <User size={16} className='text-purple-300' />
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            title="Log in"
                            className='w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 flex items-center justify-center cursor-pointer transition'
                        >
                            <User size={16} />
                        </button>
                    )}
                </div>

                <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
            </aside>
        )
    }

    // Expanded Sidebar View (ChatGPT standard sidebar)
    return (
        <>
            <aside className='hidden lg:flex flex-col w-[260px] h-screen bg-[#171717] border-r border-white/[0.08] text-[#ececec] shrink-0 select-none z-20'>
                {/* Header: Logo, Name & Collapse Button */}
                <div className='h-14 flex items-center justify-between px-3.5 border-b border-white/[0.06]'>
                    <div className='flex items-center gap-2.5'>
                        <img src="/logo.png" alt="Indus GPT" className='w-7 h-7 rounded-lg object-contain' />
                        <span className='font-semibold text-[15px] tracking-tight text-white'>Indus GPT</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <button
                            onClick={handleCreateConversation}
                            title="New chat"
                            className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer border-none bg-transparent'
                        >
                            <SquarePen size={18} />
                        </button>
                        <button
                            onClick={() => setCollapsed(true)}
                            title="Close sidebar"
                            className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer border-none bg-transparent'
                        >
                            <PanelLeft size={18} />
                        </button>
                    </div>
                </div>

                {/* New Chat Button */}
                <div className='px-3 pt-3'>
                    <button
                        onClick={handleCreateConversation}
                        className='w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm font-medium text-slate-100 transition duration-150 cursor-pointer border border-white/[0.08]'
                    >
                        <Plus size={16} className='text-slate-300' />
                        <span>New chat</span>
                    </button>
                </div>

                {/* Chat History Section */}
                <div className='flex-1 overflow-y-auto px-3 py-3 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5'>
                        Recent chats
                    </div>

                    {conversations && conversations.length > 0 ? (
                        conversations.map((conv) => {
                            const isActive = selectedConversation?._id === conv?._id
                            return (
                                <div
                                    key={conv?._id}
                                    onClick={() => dispatch(setSelectedConversation(conv))}
                                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-colors duration-150 ${
                                        isActive
                                            ? "bg-[#212121] text-white"
                                            : "text-slate-300 hover:bg-[#212121]/60 hover:text-white"
                                    }`}
                                >
                                    <MessageSquare size={15} className={`shrink-0 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                                    <span className='truncate flex-1'>{conv?.title || "New Chat"}</span>
                                </div>
                            )
                        })
                    ) : (
                        <p className='text-xs text-slate-500 px-3 py-4 text-center'>No chats yet. Start a new conversation!</p>
                    )}
                </div>

                {/* Footer Section: Credits / User profile */}
                <div className='p-3 border-t border-white/[0.08] space-y-2 bg-[#171717]'>
                    {userData ? (
                        <>
                            {/* Upgrade Plan Pill */}
                            <button
                                onClick={() => setShowBilling(true)}
                                className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-500/40 text-xs font-medium text-purple-200 transition cursor-pointer'
                            >
                                <div className='flex items-center gap-2'>
                                    <Sparkles size={14} className='text-purple-400' />
                                    <span>Upgrade Plan</span>
                                </div>
                                <span className='text-[11px] bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300'>
                                    {userData.credits ?? 100} credits
                                </span>
                            </button>

                            {/* User Profile / Logout */}
                            <div className='flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/[0.05] transition'>
                                <div
                                    onClick={() => setShowBilling(true)}
                                    className='flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer'
                                >
                                    <div className='w-8 h-8 rounded-full overflow-hidden bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0'>
                                        {userData.avatar && !imageError ? (
                                            <img src={userData.avatar} alt="user" className='w-full h-full object-cover' onError={() => setImageError(true)} />
                                        ) : (
                                            <User size={15} className='text-purple-300' />
                                        )}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='text-xs font-semibold text-slate-100 truncate'>{userData.name || "User"}</p>
                                        <p className='text-[10px] text-slate-400 capitalize'>{userData.plan || "Free plan"}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        logOut()
                                        dispatch(setUserdata(null))
                                    }}
                                    title="Log out"
                                    className='p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer border-none bg-transparent'
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className='p-1'>
                            <button
                                onClick={onLoginClick}
                                className='w-full flex items-center justify-center gap-2 text-xs font-semibold text-black bg-white hover:bg-slate-200 rounded-xl py-2.5 cursor-pointer transition'
                            >
                                Log in or Sign up
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
