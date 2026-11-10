import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { Crown, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../features/createOrder'
import { verifyPayment } from '../features/verifyPayment'
import { setUserdata } from '../redux/userSlice'
import getCurrentUser from '../features/getCurrentUser'
import { useTheme } from '../context/ThemeContext'
import RazorpayModal from './RazorpayModal'

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true)
        return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
})

function BillingDrawer({ open, onClose }) {
    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const { theme } = useTheme()
    const [payState, setPayState] = useState("")
    const [payError, setPayError] = useState("")
    const [payMode, setPayMode] = useState("")
    const [testOrder, setTestOrder] = useState(null)
    const isLight = theme === "light"
    const panelBg = isLight ? "#ffffff" : "#0f1117"
    const cardBg = isLight ? "#f8fafc" : "rgba(255,255,255,0.04)"
    const border = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"
    const heading = isLight ? "#0f172a" : "#ffffff"
    const muted = isLight ? "#64748b" : "#94a3b8"

    const applyCredits = async (result) => {
        if (result?.credits != null) {
            dispatch(setUserdata({
                ...userData,
                plan: result.plan || userData?.plan,
                credits: result.credits,
                totalCredits: result.totalCredits ?? userData?.totalCredits
            }))
            return
        }
        const me = await getCurrentUser()
        if (me?.userId || me?._id) {
            dispatch(setUserdata({
                ...userData,
                ...me,
                _id: me._id || me.userId || userData?._id,
                name: me.name || userData?.name,
                email: me.email || userData?.email,
                avatar: me.avatar || userData?.avatar
            }))
        }
    }

    const handleCompleteTestPayment = async () => {
        if (!testOrder) return
        try {
            setPayState("verifying")
            const response = {
                razorpay_order_id: testOrder.order.id,
                razorpay_payment_id: `pay_test_${Date.now()}`,
                razorpay_signature: "test_signature"
            }
            const result = await verifyPayment(response)
            await applyCredits(result)
            setTestOrder(null)
            setPayState("success")
            setPayError("")
        } catch (error) {
            setPayState("")
            setPayError(error.response?.data?.message || "Payment verification failed")
        }
    }

    const handleUpgrade = async (plan) => {
        try {
            setPayError("")
            setPayState("starting")
            let data = null
            try {
                data = await createOrder(plan)
            } catch (apiErr) {
                console.warn("createOrder API failed, using fallback test order:", apiErr)
                const planMap = {
                    starter: { id: "starter", name: "Starter", amount: 199, credits: 500 },
                    pro: { id: "pro", name: "Pro", amount: 499, credits: 1000 }
                }
                const p = planMap[plan] || planMap.starter
                data = {
                    order: {
                        id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        amount: p.amount * 100,
                        currency: "INR"
                    },
                    plan: p,
                    mode: "test"
                }
            }
            if (!data?.order?.id) {
                setPayError("Unable to start payment. Please try again.")
                setPayState("")
                return
            }
            setPayMode(data.mode || "")
            setTestOrder(data)
            setPayState("")
        } catch (error) {
            setPayState("")
            const raw = error.response?.data?.message || error.message || error
            const message = typeof raw === "object" ? JSON.stringify(raw) : String(raw)
            setPayError(error.response?.status === 401 || message?.toLowerCase().includes("unauthorized")
                ? "Your login session expired. Please sign in again."
                : message || "Payment could not be started")
        }
    }

    const credits = userData?.credits ?? 0
    const totalCredits = userData?.totalCredits || 100

    return (
        <AnimatePresence>
            {open && <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: .5 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black z-40"
                />
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: .25 }}
                    className="fixed right-0 top-0 z-50 h-screen w-full sm:w-[380px] border-l shadow-2xl flex flex-col"
                    style={{ backgroundColor: panelBg, borderColor: border }}
                >
                    <div className='flex items-center justify-between p-5 border-b' style={{ borderColor: border }}>
                        <div>
                            <div className='text-lg font-semibold' style={{ color: heading }}>
                                Billing
                            </div>
                            <div className='text-sm' style={{ color: muted }}>
                                Plans & Credits
                            </div>
                        </div>
                        <button onClick={onClose} className="icon-pop w-9 h-9 rounded-lg flex items-center justify-center border border-transparent hover:border-purple-400/40 cursor-pointer" style={{ backgroundColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)" }}>
                            <X size={18} className="text-purple-500" />
                        </button>
                    </div>
                    <div className='p-5'>
                        <div className='rounded-xl border p-4' style={{ backgroundColor: cardBg, borderColor: border }}>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <p className='text-sm' style={{ color: muted }}>
                                        Current Plan
                                    </p>
                                    <h3 className='text-xl font-bold capitalize' style={{ color: heading }}>
                                        {userData?.plan || "free"}
                                    </h3>
                                </div>
                                <Crown className='text-yellow-400' />
                            </div>
                            <div className='mt-5'>
                                <div className='flex justify-between text-xs mb-2' style={{ color: muted }}>
                                    <span>Credits</span>
                                    <span>{credits}/{totalCredits}</span>
                                </div>
                                <div className='h-2 rounded-full overflow-hidden' style={{ backgroundColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)" }}>
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min(100, (credits / (totalCredits || 1)) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {payError && (
                        <p className='mx-5 mb-3 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2'>{payError}</p>
                    )}
                    {payState === "success" && (
                        <p className='mx-5 mb-3 text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2'>Payment complete. Credits have been added.</p>
                    )}
                    <RazorpayModal
                        open={Boolean(testOrder)}
                        onClose={() => setTestOrder(null)}
                        orderData={testOrder}
                        userData={userData}
                        onSuccess={async (response) => {
                            try {
                                setPayState("verifying")
                                const result = await verifyPayment(response)
                                await applyCredits(result)
                                setTestOrder(null)
                                setPayState("success")
                                setPayError("")
                            } catch (error) {
                                setPayState("")
                                setPayError(error.response?.data?.message || "Payment verification failed")
                            }
                        }}
                        onError={(err) => {
                            setPayState("")
                            setPayError(err.message || "Payment failed")
                        }}
                    />
                    <div className='px-5 flex-1 overflow-auto space-y-4 pb-5'>
                        <div className='rounded-xl border p-4' style={{ backgroundColor: cardBg, borderColor: border }}>
                            <h3 className='font-semibold' style={{ color: heading }}>Starter Plan</h3>
                            <p className='text-purple-500 text-2xl font-bold mt-2'>₹199</p>
                            <p className='text-sm mt-1' style={{ color: muted }}>500 Credits</p>
                            <button className='icon-pop btn-fancy-purple mt-4 w-full rounded-xl py-2 text-white font-medium cursor-pointer border-none disabled:opacity-60' disabled={payState === "starting" || payState === "verifying"} onClick={() => handleUpgrade("starter")}>Upgrade</button>
                        </div>
                        <div className='rounded-xl border p-4' style={{ backgroundColor: cardBg, borderColor: border }}>
                            <h3 className='font-semibold' style={{ color: heading }}>Pro Plan</h3>
                            <p className='text-purple-500 text-2xl font-bold mt-2'>₹499</p>
                            <p className='text-sm mt-1' style={{ color: muted }}>1000 Credits</p>
                            <button className='icon-pop btn-fancy-purple mt-4 w-full rounded-xl py-2 text-white font-medium cursor-pointer border-none disabled:opacity-60' disabled={payState === "starting" || payState === "verifying"} onClick={() => handleUpgrade("pro")}>Upgrade</button>
                        </div>
                    </div>
                </motion.div>
            </>}
        </AnimatePresence>
    )
}

export default BillingDrawer
