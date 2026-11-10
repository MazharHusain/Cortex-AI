import axios from "axios"
import crypto from "crypto"
import { PLANS } from "../config/Plans.js"
import { getRazorpayClient, getRazorpayConfig } from "../config/razorpay.js"
import Payment from "../models/payment.model.js"

const userIdFrom = (req) => req.user?.userId || req.user?._id || req.headers["x-user-id"]

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
        const { client, config } = getRazorpayClient()
        const order = await client.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`.slice(0, 40),
            notes: {
                userId: String(userId),
                plan: selectedPlan.id
            }
        })
        await Payment.create({
            userId: String(userId),
            orderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            plan: selectedPlan.id,
            currency: order.currency,
            status: "created",
            keyMode: config.mode
        })
        return res.status(200).json({
            order,
            plan: selectedPlan,
            keyId: config.keyId,
            mode: config.mode
        })
    } catch (error) {
        return res.status(500).json({ message: `create order error ${error.message || error}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
        const config = getRazorpayConfig(payment.keyMode)
        if (!config.keySecret) {
            return res.status(500).json({ message: "Payment verification is not configured" })
        }
        const generateSignature = crypto
            .createHmac("sha256", config.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")
        const expected = Buffer.from(generateSignature, "hex")
        const received = Buffer.from(razorpay_signature, "hex")
        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            return res.status(400).json({ message: "Payment Verification Failed" })
        }
        if (!process.env.BILLING_INTERNAL_SECRET) {
            return res.status(500).json({ message: "Billing service authentication is not configured" })
        }
        const { data } = await axios.post(`${process.env.AUTH_SERVICE}/update-plan`, {
            userId: payment.userId,
            plan: payment.plan,
            credits: payment.credits,
            orderId: payment.orderId
        }, {
            headers: { "x-billing-secret": process.env.BILLING_INTERNAL_SECRET }
        })
        payment.status = "paid"
        payment.paymentId = razorpay_payment_id
        await payment.save()
        return res.status(200).json({
            message: "Payment Verified",
            plan: data?.plan || payment.plan,
            credits: data?.credits,
            totalCredits: data?.totalCredits,
            creditsAdded: payment.credits
        })
    } catch (error) {
        return res.status(500).json({ message: `verify payment error ${error.message || error}` })
    }
}
