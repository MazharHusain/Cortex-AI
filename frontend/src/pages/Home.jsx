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

function Home() {
    const { userData, loading } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
            setShowLoginModal(false)
        } catch (error) {
            console.log(error)
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
            console.log(error)
            if (error.code === 'auth/popup-blocked') {
                setLoginError('Popup blocked. Please allow popups for this site.')
            } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                // user closed popup - ignore silently
            } else {
                setLoginError(error.message || error.code || 'Google login failed. Please try again.')
            }
        } finally {
            setLoginLoading(false)
        }
    }

    // Show spinner while checking session
    if (loading) {
        return (
            <div className='h-screen flex items-center justify-center bg-[#0d0f14]'>
                <div className='w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
        )
    }

    return (
        <div className='h-screen flex bg-[#0d0f14] text-white overflow-hidden'>

            <SideBar onLoginClick={() => setShowLoginModal(true)} />
            <ChatArea onLoginClick={() => setShowLoginModal(true)} />
            <Artifact />

            {/* Login Modal — appears ONLY when user clicks Login button */}
            {showLoginModal && !userData && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
                    onClick={() => setShowLoginModal(false)}
                >
                    <div
                        className='w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5'
                        onClick={e => e.stopPropagation()}
                    >
                        <div className='flex flex-col gap-1'>
                            <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to Indus AI</h2>
                            <p className='text-[13px] text-slate-500'>Sign in to continue using the app.</p>
                        </div>

                        {loginError && (
                            <p className='text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>{loginError}</p>
                        )}

                        <button
                            className='w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-100 transition-all duration-150 cursor-pointer disabled:opacity-60'
                            onClick={googleLogin}
                            disabled={loginLoading}
                        >
                            {loginLoading
                                ? <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
                                : <FcGoogle size={16} />
                            }
                            {loginLoading ? 'Signing in...' : 'Continue With Google'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
