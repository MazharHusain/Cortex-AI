import React, { useState, useEffect } from 'react'
import { Check, CreditCard, Lock, ShieldCheck, Smartphone, X } from 'lucide-react'

function RazorpayModal({ open, onClose, orderData, userData, onSuccess, onError }) {
  const [phase, setPhase] = useState("loading")
  const [activeTab, setActiveTab] = useState("cards")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [saveCard, setSaveCard] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [selectedUpiApp, setSelectedUpiApp] = useState("")
  const [selectedBank, setSelectedBank] = useState("HDFC")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setPhase("loading")
      setCardNumber("")
      setCardExpiry("")
      setCardCvv("")
      setCardHolder("")
      setSaveCard(false)
      const t = setTimeout(() => setPhase("form"), 1600)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open || !orderData) return null

  const planName = orderData.plan?.name || "Starter"
  const amount = orderData.plan?.amount || (orderData.order?.amount ? orderData.order.amount / 100 : 199)
  const creditsToAdd = orderData.plan?.credits || 500
  const userIdentifier = userData?.email || userData?.name || "+91 98765 43211"

  const isFormValid = () => {
    if (activeTab === "cards") {
      const cleanCard = cardNumber.replace(/\s/g, '')
      if (!cleanCard || cleanCard.length < 16) return false
      if (!cardExpiry.trim()) return false
      const parts = cardExpiry.split('/')
      const mm = parseInt(parts[0]?.trim(), 10)
      if (!mm || mm < 1 || mm > 12) return false
      if (!cardCvv.trim() || cardCvv.trim().length < 3) return false
      if (!cardHolder.trim()) return false
      return true
    }
    if (activeTab === "upi") {
      if (selectedUpiApp) return true
      if (upiId.trim() && upiId.includes("@")) return true
      return false
    }
    if (activeTab === "netbanking") {
      return Boolean(selectedBank)
    }
    return false
  }

  const validateForm = () => {
    const errs = {}
    if (activeTab === "cards") {
      const cleanCard = cardNumber.replace(/\s/g, '')
      if (!cleanCard) {
        errs.cardNumber = "Card number is required"
      } else if (cleanCard.length < 16) {
        errs.cardNumber = "Enter complete 16-digit card number"
      }

      if (!cardExpiry.trim()) {
        errs.cardExpiry = "Expiry date is required"
      } else {
        const parts = cardExpiry.split('/')
        const mm = parseInt(parts[0]?.trim(), 10)
        if (!mm || mm < 1 || mm > 12) {
          errs.cardExpiry = "Invalid expiry month"
        }
      }

      if (!cardCvv.trim()) {
        errs.cardCvv = "CVV is required"
      } else if (cardCvv.trim().length < 3) {
        errs.cardCvv = "Enter 3 or 4-digit CVV"
      }

      if (!cardHolder.trim()) {
        errs.cardHolder = "Cardholder name is required"
      }
    } else if (activeTab === "upi") {
      if (!selectedUpiApp && !upiId.trim()) {
        errs.upiId = "Please select an app or enter UPI ID"
      } else if (upiId.trim() && !upiId.includes("@")) {
        errs.upiId = "Invalid UPI ID format (e.g. name@okhdfcbank)"
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const canSubmit = isFormValid()

  const handlePay = async () => {
    if (!validateForm()) return
    setIsProcessing(true)
    try {
      let paymentId = "pay_test_" + Date.now()
      if (activeTab === "upi") {
        paymentId = "pay_upi_" + Date.now()
      } else if (activeTab === "netbanking") {
        paymentId = "pay_nb_" + Date.now()
      }

      const response = {
        razorpay_order_id: orderData.order?.id || ("order_test_" + Date.now()),
        razorpay_payment_id: paymentId,
        razorpay_signature: "test_signature_" + Date.now()
      }

      setPhase("success")
      setTimeout(async () => {
        try {
          await onSuccess(response)
        } catch (err) {
          if (onError) onError(err)
        }
      }, 2800)
    } catch (err) {
      if (onError) onError(err)
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 16)
    const parts = raw.match(/.{1,4}/g) || []
    return parts.join(' ')
  }

  const formatExpiry = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    if (raw.length > 2) {
      return `${raw.slice(0, 2)} / ${raw.slice(2)}`
    }
    return raw
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
        <div
          className="w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center bg-white"
          style={{ minHeight: "340px" }}
        >
          <div className="flex flex-col items-center gap-6 py-12 px-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
              style={{ background: "linear-gradient(145deg, #0284c7 0%, #075985 100%)" }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 11V21C6 29.284 12.144 37.014 20 39C27.856 37.014 34 29.284 34 21V11L20 4Z" fill="white" fillOpacity="0.95" />
                <path d="M20 10L10 15V21C10 26.9 14.6 32.5 20 34.2C25.4 32.5 30 26.9 30 21V15L20 10Z" fill="#0284c7" />
              </svg>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">Secure Checkout</h3>
              <p className="text-sm text-slate-500">Setting up your payment…</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>256-Bit SSL Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === "success") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
        <div
          className="w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center bg-white"
          style={{ minHeight: "340px" }}
        >
          <div className="flex flex-col items-center gap-5 py-12 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-md">
              <Check size={38} className="text-emerald-500" strokeWidth={3} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Payment Successful!</h3>
              <p className="text-sm text-slate-500">{planName} Plan activated</p>
            </div>
            <div
              className="rounded-xl px-5 py-3 text-center"
              style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "1px solid #6ee7b7" }}
            >
              <p className="text-2xl font-extrabold text-emerald-600">+{creditsToAdd}</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">Credits Added to Your Account</p>
            </div>
            <p className="text-[11px] text-slate-400">Closing automatically…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 select-none overflow-y-auto">
      <div 
        className="relative w-full max-w-[820px] my-auto max-h-[96vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row bg-white border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        style={{ minHeight: "440px" }}
      >
        {/* Left Blue Sidebar (Brand + Price Summary) */}
        <div 
          className="w-full md:w-[280px] p-4 sm:p-6 flex flex-col justify-between text-white shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0284c7 0%, #0369a1 40%, #075985 100%)"
          }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
          <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none blur-lg" />

          {/* Top Brand Info */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-inner">
                I
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight tracking-tight">Indus GPT</h3>
                <p className="text-[11px] text-sky-100/80">{planName} Plan</p>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="rounded-xl bg-white/15 backdrop-blur-md p-4 border border-white/20 shadow-sm space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-sky-100/80 font-medium">Price Summary</p>
              <p className="text-3xl font-extrabold tracking-tight">₹{amount}.00</p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-sky-100">
                <Check size={13} className="text-emerald-300 shrink-0" />
                <span>+{creditsToAdd} Credits Included</span>
              </div>
            </div>

            {/* User Details Pill */}
            <div className="rounded-lg bg-black/15 px-3 py-2 text-[11px] text-sky-100/90 flex items-center gap-2 truncate">
              <span className="shrink-0">👤</span>
              <span className="truncate">{userIdentifier}</span>
            </div>
          </div>

          {/* Bottom Trust & Razorpay Branding */}
          <div className="pt-6 relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-sky-100/80">
              <ShieldCheck size={16} className="text-emerald-300 shrink-0" />
              <span>256-Bit SSL Secured Payment</span>
            </div>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-sky-100/70">
              <span>Secured by</span>
              <span className="font-bold tracking-wider text-white">Razorpay</span>
            </div>
          </div>
        </div>

        {/* Right Section (Payment Options & Content) */}
        <div className="flex-1 flex flex-col bg-white text-slate-800">
          {/* Modal Header */}
          <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-base text-slate-800">Payment Options</h4>
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Left Tabs + Right Tab Form */}
          <div className="flex-1 flex flex-col sm:flex-row">
            {/* Tabs List */}
            <div className="w-full sm:w-[170px] border-r border-slate-100 bg-slate-50/60 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("cards")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer border-none ${
                  activeTab === "cards"
                    ? "bg-sky-50 text-sky-700 shadow-sm font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CreditCard size={15} className={activeTab === "cards" ? "text-sky-600" : "text-slate-400"} />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer border-none ${
                  activeTab === "upi"
                    ? "bg-sky-50 text-sky-700 shadow-sm font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Smartphone size={15} className={activeTab === "upi" ? "text-sky-600" : "text-slate-400"} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer border-none ${
                  activeTab === "netbanking"
                    ? "bg-sky-50 text-sky-700 shadow-sm font-bold"
                    : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Lock size={15} className={activeTab === "netbanking" ? "text-sky-600" : "text-slate-400"} />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Tab Form Content */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
              {activeTab === "cards" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Add a new card</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-600">VISA</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-red-500">MC</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-orange-600">RuPay</span>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(formatCardNumber(e.target.value))
                          if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: "" }))
                        }}
                        placeholder="4111 1111 1111 1111"
                        maxLength={19}
                        className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono text-slate-800 outline-none transition ${
                          errors.cardNumber ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        }`}
                      />
                      <span className="absolute right-3.5 top-3 text-[10px] font-bold text-blue-600 tracking-wider">VISA</span>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.cardNumber}</p>
                    )}
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Expiry (MM / YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          setCardExpiry(formatExpiry(e.target.value))
                          if (errors.cardExpiry) setErrors(prev => ({ ...prev, cardExpiry: "" }))
                        }}
                        placeholder="MM / YY"
                        maxLength={7}
                        className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono text-slate-800 outline-none transition ${
                          errors.cardExpiry ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        }`}
                      />
                      {errors.cardExpiry && (
                        <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.cardExpiry}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.slice(0, 4))
                          if (errors.cardCvv) setErrors(prev => ({ ...prev, cardCvv: "" }))
                        }}
                        placeholder="•••"
                        maxLength={4}
                        className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono text-slate-800 outline-none transition ${
                          errors.cardCvv ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        }`}
                      />
                      {errors.cardCvv && (
                        <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.cardCvv}</p>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value)
                        if (errors.cardHolder) setErrors(prev => ({ ...prev, cardHolder: "" }))
                      }}
                      placeholder="Name on card"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-800 outline-none transition ${
                        errors.cardHolder ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      }`}
                    />
                    {errors.cardHolder && (
                      <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.cardHolder}</p>
                    )}
                  </div>

                  {/* Save Card Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 border-slate-300"
                    />
                    <span className="text-[11.5px] text-slate-600 font-medium">Save this card securely for future payments</span>
                  </label>
                </div>
              )}

              {activeTab === "upi" && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pay using UPI</span>

                  {/* Popular UPI Apps */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "gpay", name: "Google Pay", color: "text-blue-600" },
                      { id: "phonepe", name: "PhonePe", color: "text-purple-600" },
                      { id: "paytm", name: "Paytm", color: "text-sky-600" },
                      { id: "bhim", name: "BHIM UPI", color: "text-emerald-600" }
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          selectedUpiApp === app.id
                            ? "border-sky-500 bg-sky-50/60 text-sky-900"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className={app.color}>{app.name}</span>
                        {selectedUpiApp === app.id && <Check size={14} className="text-sky-600" />}
                      </button>
                    ))}
                  </div>

                  {/* Or Enter UPI ID */}
                  <div className="pt-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Or enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value)
                        if (errors.upiId) setErrors(prev => ({ ...prev, upiId: "" }))
                      }}
                      placeholder="mobile-number@upi or name@okaxis"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-800 outline-none transition ${
                        errors.upiId ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      }`}
                    />
                    {errors.upiId && (
                      <p className="text-[11px] text-red-500 font-medium pt-0.5">{errors.upiId}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    A payment request will be sent to your UPI application.
                  </p>
                </div>
              )}

              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular Banks</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["HDFC", "SBI", "ICICI", "Axis", "Kotak", "Punjab National Bank"].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                          selectedBank === bank
                            ? "border-sky-500 bg-sky-50/60 text-sky-900 font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{bank}</span>
                        {selectedBank === bank && <Check size={14} className="text-sky-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <div className="pt-5 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing || !canSubmit}
                  className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border-none hover:opacity-95"
                  style={{
                    backgroundColor: canSubmit ? "#0284c7" : "#94a3b8"
                  }}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Pay ₹{amount}.00</span>
                      <span className="text-sky-200 font-normal">| Continue</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RazorpayModal
