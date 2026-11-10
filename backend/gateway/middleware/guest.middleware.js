import crypto from "crypto"
import redis from "../redis/redis.js"

const GUEST_LIMIT = 10
const GUEST_TTL = 30 * 24 * 60 * 60

const optionalAuth = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session
        if (sessionId) {
            const session = await redis.get(`session-${sessionId}`)
            if (session) {
                req.user = JSON.parse(session)
            }
        }
        next()
    } catch (error) {
        next()
    }
}

const guestChatGate = async (req, res, next) => {
    if (req.user) {
        return next()
    }
    try {
        let guestId = req.cookies?.guestId
        let isNew = false
        if (!guestId) {
            guestId = crypto.randomUUID()
            isNew = true
        }
        const key = `guest-chats-${guestId}`
        const count = await redis.incr(key)
        if (count === 1) {
            await redis.expire(key, GUEST_TTL)
        }
        if (count > GUEST_LIMIT) {
            await redis.decr(key)
            return res.status(401).json({
                message: "Please sign up or log in to continue chatting.",
                code: "GUEST_LIMIT"
            })
        }
        req.guestId = guestId
        if (isNew) {
            const maxAge = GUEST_TTL
            req.guestSetCookie = `guestId=${guestId}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=None`
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: "guest chat error" })
    }
}

export { optionalAuth, guestChatGate }
