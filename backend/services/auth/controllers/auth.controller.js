import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import { createConnection } from "mongoose"
import redis from "../redis/redis.js"
import crypto from "crypto"

export const login = async (req, res) => {
    try {
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)
        let user = null

        try {
            user = await User.findOne({
                firebaseUid: decoded.uid
            })

            if (!user) {
                user = await User.create({
                    firebaseUid: decoded.uid,
                    name: decoded.name || "User",
                    email: decoded.email || "",
                    avatar: decoded.picture || ""
                })
            }
        } catch (dbError) {
            console.error("MongoDB login fallback (DB offline):", dbError.message)
            // Resilient fallback when MongoDB Atlas cluster is offline/paused
            // Uses Redis session so user can still successfully log in
            const fallbackId = "usr_" + Buffer.from(decoded.uid).toString("hex").slice(0, 24)
            user = {
                _id: fallbackId,
                firebaseUid: decoded.uid,
                name: decoded.name || "User",
                email: decoded.email || "",
                avatar: decoded.picture || "",
                plan: "free",
                credits: 100,
                totalCredits: 100,
                planExpiresAt: null
            }
        }

        const sessionId = crypto.randomUUID()
        await redis.set(`user-session-${user?._id}`,
            sessionId
            , "EX", 7 * 24 * 60 * 60)
        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan || "free",
            credits: user.credits ?? 100,
            totalCredits: user.totalCredits ?? 100,
            planExpiresAt: user.planExpiresAt || null
        }), "EX", 7 * 24 * 60 * 60)




        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)

    } catch (error) {
        console.error("Login fatal error:", error)
        return res.status(500).json({ message: `login error: ${error.message || error}` })
    }
}


export const logOut = async (req, res) => {
    try {
        const sessionId = req.cookies?.session
        await redis.del(`session-${sessionId}`)

        res.clearCookie("session", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        return res.status(200).json({ message: "logout successfully" })
    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}


const isObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id || ""))

export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId, orderId } = req.body
        const configuredSecret = process.env.BILLING_INTERNAL_SECRET
        const suppliedSecret = req.get("x-billing-secret") || ""
        if (!configuredSecret || suppliedSecret.length !== configuredSecret.length || !crypto.timingSafeEqual(Buffer.from(suppliedSecret), Buffer.from(configuredSecret))) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const creditsToAdd = Number(credits)
        if (!userId || !orderId || !plan || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
            return res.status(400).json({ message: "Invalid payment update" })
        }
        const orderKey = `payment-order-${orderId}`
        const lockKey = `${orderKey}-lock`
        const cached = await redis.get(orderKey)
        if (cached) return res.status(200).json(JSON.parse(cached))
        const lock = await redis.set(lockKey, "processing", "EX", 60, "NX")
        if (!lock) return res.status(409).json({ message: "Payment update is processing; retry shortly" })
        try {
            const sessionId = await redis.get(`user-session-${userId}`)
            let user = null
            if (isObjectId(userId)) {
                await User.updateOne(
                    { _id: userId, paymentOrderIds: { $ne: orderId } },
                    {
                        $set: { plan, planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                        $inc: { credits: creditsToAdd, totalCredits: creditsToAdd },
                        $addToSet: { paymentOrderIds: orderId }
                    }
                )
                user = await User.findById(userId)
            }
            if (!sessionId && !user) return res.status(404).json({ message: "User not found" })
            const raw = sessionId ? await redis.get(`session-${sessionId}`) : null
            const session = raw ? JSON.parse(raw) : null
            if (!user && !session) return res.status(404).json({ message: "User session not found" })
            const payload = {
                success: true,
                plan: user?.plan || plan,
                credits: user?.credits ?? (Number(session.credits) || 0) + creditsToAdd,
                totalCredits: user?.totalCredits ?? (Number(session.totalCredits) || 0) + creditsToAdd
            }
            if (sessionId) {
                await redis.set(`session-${sessionId}`, JSON.stringify({ ...session, ...payload }), "EX", 7 * 24 * 60 * 60)
            }
            await redis.set(orderKey, JSON.stringify(payload), "EX", 366 * 24 * 60 * 60)
            return res.status(200).json(payload)
        } finally {
            await redis.del(lockKey)
        }
    } catch (error) {
        return res.status(500).json({ message: `update user payment error ${error}` })
    }
}


export const deductCredits = async (req, res) => {
    try {
        const { userId, agent } = req.body
        
        const COST = {

            chat: 1,

            search: 5,

            coding: 10,

            pdf: 10,

            ppt: 10,

            vision: 10

        };

        const user=await User.findById(userId)

        if(!user){
            return res.status(400).json({message:"user not found"})
        }

       const requiredCredits=COST[agent] || 1
        if(user.credits<requiredCredits){
         return res.status(400).json({message:"Not enough credits."})
        }
        user.credits-=requiredCredits
        await user.save()

       const sessionId = await redis.get(`user-session-${user?._id}`)
        console.log("sessionId", sessionId)
        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpiresAt: user.planExpiresAt
        }), "EX", 7 * 24 * 60 * 60)

        return res.status(200).json({ success: true ,credits:user.credits})
    } catch (error) {
 return res.status(500).json({ message: `deduct credits error ${error}` })
    }
}
