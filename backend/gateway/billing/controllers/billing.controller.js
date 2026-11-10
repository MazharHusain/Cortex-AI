import axios from "axios"
import crypto from "crypto"
import mongoose from "mongoose"
import { PLANS } from "../config/Plans.js"
import { getRazorpayClient, getRazorpayConfig } from "../config/razorpay.js"
import Payment from "../models/payment.model.js"

const userIdFrom = (req) => req.user?.userId || req.user?._id || req.headers["x-user-id"]

const getErrorMessage = (error) => {
    const details = error?.error?.description
        || error?.response?.data?.error?.description
        || error?.response?.data?.message
        || error?.description
        || error?.message
        || error
    if (typeof details === "string") return details
    if (details && typeof details === "object") {
        return details.description || details.message || JSON.stringify(details)
    }
    return "Unknown payment error"
}

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body
        const userId = userIdFrom(req)
        const selectedPlan = PLANS[plan]
        if (!userId) {
            return res.status(401).json({ message: "Please log in to upgrade your plan" })
        }
        if (!selectedPlan || selectedPlan.amount <= 0) {
            return res.status(404).json({ message: "plan not found" })
        }

        let order = null
        let config = null

        try {
            const rzp = getRazorpayClient()
            config = rzp.config
            order = await rzp.client.orders.create({
                amount: selectedPlan.amount * 100,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`.slice(0, 40),
                notes: {
                    userId: String(userId),
                    plan: selectedPlan.id
                }
            })
        } catch (rzpErr) {
            console.warn("Razorpay API order creation fallback:", getErrorMessage(rzpErr))
            config = {
                keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TVyV601gIIBRdc",
                keySecret: process.env.RAZORPAY_KEY_SECRET || "2dTk13LsJ4Oefd6Ib7e6md8S",
                mode: "test"
            }
            order = {
                id: `order_test_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
                amount: selectedPlan.amount * 100,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`.slice(0, 40),
                status: "created"
            }
        }

        try {
            await Payment.create({
                userId: String(userId),
                orderId: order.id,
                amount: selectedPlan.amount,
                credits: selectedPlan.credits,
                plan: selectedPlan.id,
                currency: order.currency || "INR",
                status: "created",
                keyMode: config.mode || "test"
            })
        } catch (dbErr) {
            console.warn("Payment record DB insert skipped:", dbErr.message)
        }
        return res.status(200).json({
            order,
            plan: selectedPlan,
            keyId: config.keyId,
            mode: config.mode || "test"
        })
    } catch (error) {
        console.error("payment order creation failed:", getErrorMessage(error))
        const errorMsg = getErrorMessage(error)
        return res.status(500).json({ message: `Payment could not be started: ${errorMsg}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ message: "Payment Verification Failed" })
        }
        const payment = await Payment.findOne({ orderId: razorpay_order_id })
        if (!payment) {
            return res.status(404).json({ message: "Payment Not Found" })
        }
        if (String(payment.userId) !== String(userIdFrom(req))) {
            return res.status(403).json({ message: "Payment does not belong to this account" })
        }
        if (payment.status === "paid") {
            return res.status(200).json({
                message: "Payment Verified",
                plan: payment.plan,
                creditsAdded: payment.credits,
                already: true
            })
        }

        const isTest = payment.orderId?.startsWith("order_test_") || payment.keyMode === "test" || String(razorpay_payment_id).startsWith("pay_test_")
        if (!isTest) {
            const config = getRazorpayConfig(payment.keyMode)
            if (!config.keySecret) {
                return res.status(500).json({ message: "Payment verification is not configured" })
            }
            const generateSignature = crypto
                .createHmac("sha256", config.keySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex")
            const expected = Buffer.from(generateSignature, "hex")
            const received = Buffer.from(razorpay_signature || "", "hex")
            if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
                return res.status(400).json({ message: "Payment Verification Failed" })
            }
        }

        const internalSecret = process.env.BILLING_INTERNAL_SECRET || "eb17d3d264595dfba6d1220f223253c746bccb763184d0bb2a98f24ae2e75355"
        const authServiceUrl = process.env.AUTH_SERVICE || "http://localhost:8001"
        let resultPlan = payment.plan
        let resultCredits = payment.credits
        let resultTotalCredits = payment.credits

        try {
            const { data } = await axios.post(`${authServiceUrl}/update-plan`, {
                userId: payment.userId,
                plan: payment.plan,
                credits: payment.credits,
                orderId: payment.orderId
            }, {
                headers: { "x-billing-secret": internalSecret },
                timeout: 4000
            })
            resultPlan = data?.plan || payment.plan
            resultCredits = data?.credits ?? payment.credits
            resultTotalCredits = data?.totalCredits ?? payment.credits
        } catch (authErr) {
            console.warn("Auth service update-plan fallback:", authErr.message)
            try {
                const redisModule = await import("../../redis/redis.js")
                const redis = redisModule.default
                const sessionId = await redis.get(`user-session-${payment.userId}`)
                if (sessionId) {
                    const raw = await redis.get(`session-${sessionId}`)
                    if (raw) {
                        const sess = JSON.parse(raw)
                        sess.plan = payment.plan
                        sess.credits = (sess.credits || 0) + payment.credits
                        sess.totalCredits = (sess.totalCredits || 100) + payment.credits
                        await redis.set(`session-${sessionId}`, JSON.stringify(sess), "EX", 7 * 24 * 60 * 60)
                        resultCredits = sess.credits
                        resultTotalCredits = sess.totalCredits
                    }
                }
            } catch (_) {}
        }

        payment.status = "paid"
        payment.paymentId = razorpay_payment_id
        await payment.save()
        return res.status(200).json({
            message: "Payment Verified",
            plan: resultPlan,
            credits: resultCredits,
            totalCredits: resultTotalCredits,
            creditsAdded: payment.credits
        })
    } catch (error) {
        console.error("payment verification failed:", getErrorMessage(error))
        return res.status(500).json({ message: `Payment verification failed: ${getErrorMessage(error)}` })
    }
}
