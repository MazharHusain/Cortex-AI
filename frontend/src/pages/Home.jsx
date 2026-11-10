import { signInWithPopup } from 'firebase/auth'
import React, { useState } from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc"
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice'
import SideBar from '../components/SideBar'
import ChatArea from '../components/ChatArea'
import Artifact from '../components/Artifact'
import { X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function Home() {
    const { userData, loading } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const { theme } = useTheme()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginReason, setLoginReason] = useState("")
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const handleLogin = async (token, profile = {}) => {
        try {
            const { data } = await api.post("/api/auth/login", { token, avatar: profile.avatar })
            dispatch(setUserdata({
                ...data,
                name: data.name || profile.name || "User",
                email: data.email || profile.email || "",
                avatar: data.avatar || profile.avatar || ""
            }))
            setShowLoginModal(false)
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Login failed. Please try again.'
            setLoginError(msg)
        }
    }

    const googleLogin = async () => {
        try {
            setLoginLoading(true)
            setLoginError('')
            const result = await signInWithPopup(auth, googleProvider)
            const token = await result.user.getIdToken()
            await handleLogin(token, {
                name: result.user.displayName,
                email: result.user.email,
                avatar: result.user.photoURL
            })
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                setLoginError('Popup blocked. Please allow popups for this site.')
            } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
            } else {
                setLoginError(error.message || error.code || 'Google login failed. Please try again.')
            }
        } finally {
            setLoginLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='h-screen flex flex-col items-center justify-center bg-[#212121] gap-3'>
                <div className='w-14 h-14 flex items-center justify-center animate-pulse bg-transparent' style={{ background: 'transparent' }}>
                    <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ background: 'transparent' }} />
                </div>
                <div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
        )
    }

    return (
        <div className='h-screen h-[100dvh] flex overflow-hidden font-sans transition-colors' style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <SideBar
                onLoginClick={(reason) => {
                    setLoginReason(reason || "")
                    setShowLoginModal(true)
                }}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
            />

            <ChatArea
                onLoginClick={(reason) => {
                    setLoginReason(reason || "")
                    setShowLoginModal(true)
                }}
                onToggleSidebar={() => {
                    if (window.innerWidth < 1024) {
                        setMobileSidebarOpen(prev => !prev)
                    } else {
                        setSidebarCollapsed(prev => !prev)
                    }
                }}
            />

            <Artifact />

            {showLoginModal && !userData && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
                    onClick={() => setShowLoginModal(false)}
                >
                    <div
                        className='w-full max-w-[360px] rounded-3xl p-7 flex flex-col gap-6 shadow-2xl relative border transition-colors'
                        style={{
                            backgroundColor: theme === 'light' ? '#ffffff' : '#171717',
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: theme === 'light' ? '0 20px 40px rgba(0, 0, 0, 0.12)' : '0 20px 40px rgba(0, 0, 0, 0.6)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className='absolute top-4 right-4 p-1 rounded-full transition cursor-pointer border-none bg-transparent'
                            style={{
                                color: theme === 'light' ? '#64748b' : '#94a3b8'
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div className='flex flex-col items-center text-center gap-3 pt-2'>
                            <div className='w-16 h-16 flex items-center justify-center bg-transparent border-none shadow-none' style={{ background: 'transparent' }}>
                                <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' style={{ background: 'transparent' }} />
                            </div>
                            <div className='space-y-1'>
                                <h2
                                    className='text-[20px] font-semibold tracking-tight'
                                    style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
                                >
                                    Welcome to Indus GPT
                                </h2>
                                <p
                                    className='text-[13px]'
                                    style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}
                                >
                                    {loginReason === "limit"
                                        ? "You have used 10 free chats. Sign up or log in to continue."
                                        : loginReason === "attach"
                                        ? "Please log in to attach files or media."
                                        : "Log in or sign up to save your chat history and continue."}
                                </p>
                            </div>
                        </div>

                        {loginError && (
                            <p className='text-[12px] text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 text-center'>
                                {loginError}
                            </p>
                        )}

                        <button
                            className='icon-pop w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-[14px] font-semibold text-white btn-fancy-purple cursor-pointer disabled:opacity-60 shadow-lg border-none'
                            onClick={googleLogin}
                            disabled={loginLoading}
                        >
                            {loginLoading ? (
                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                            ) : (
                                <div className='w-6 h-6 rounded-full bg-white flex items-center justify-center'>
                                    <FcGoogle size={18} />
                                </div>
                            )}
                            <span>{loginLoading ? 'Signing in...' : 'Continue with Google'}</span>
                        </button>

                        <p
                            className='text-[11px] text-center'
                            style={{ color: theme === 'light' ? '#64748b' : '#64748b' }}
                        >
                            By continuing, you agree to our Terms of Service & Privacy Policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
