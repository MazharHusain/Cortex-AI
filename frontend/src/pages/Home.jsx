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

function Home() {
    const { userData, loading } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
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
            await handleLogin(token)
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                setLoginError('Popup blocked. Please allow popups for this site.')
            } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                // user closed popup
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
                <div className='w-14 h-14 rounded-2xl bg-white/[0.05] p-2 flex items-center justify-center animate-pulse'>
                    <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' />
                </div>
                <div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
        )
    }

    return (
        <div className='h-screen flex bg-[#212121] text-[#ececec] overflow-hidden font-sans'>
            <SideBar
                onLoginClick={() => setShowLoginModal(true)}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <ChatArea
                onLoginClick={() => setShowLoginModal(true)}
                onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
            />

            <Artifact />

            {showLoginModal && !userData && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
                    onClick={() => setShowLoginModal(false)}
                >
                    <div
                        className='w-full max-w-[360px] bg-[#171717] border border-white/[0.1] rounded-3xl p-7 flex flex-col gap-6 shadow-2xl relative'
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className='absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.08] transition cursor-pointer border-none bg-transparent'
                        >
                            <X size={18} />
                        </button>

                        <div className='flex flex-col items-center text-center gap-3 pt-2'>
                            <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-blue-500/30 border border-white/10 p-1.5 shadow-xl flex items-center justify-center'>
                                <img src="/logo.png" alt="Indus GPT" className='w-full h-full object-contain' />
                            </div>
                            <div className='space-y-1'>
                                <h2 className='text-[20px] font-semibold text-white tracking-tight'>Welcome to Indus GPT</h2>
                                <p className='text-[13px] text-slate-400'>Log in or sign up to save your chat history and continue.</p>
                            </div>
                        </div>

                        {loginError && (
                            <p className='text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 text-center'>
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

                        <p className='text-[11px] text-slate-500 text-center'>
                            By continuing, you agree to our Terms of Service & Privacy Policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
