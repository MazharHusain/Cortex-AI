import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const realRedis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 200, 1000)
    },
    enableOfflineQueue: false,
    lazyConnect: true
})

let isConnected = false

realRedis.on("error", () => {})
realRedis.on("connect", () => {
    isConnected = true
    console.log("redis connected")
})
realRedis.on("close", () => {
    isConnected = false
})

realRedis.connect().catch(() => {
    console.log("local redis offline (in-memory store active)")
})

const memoryStore = new Map()

const redis = {
    async get(key) {
        if (isConnected) {
            try { return await realRedis.get(key) } catch (_) {}
        }
        const item = memoryStore.get(key)
        if (!item) return null
        if (item.expires && item.expires < Date.now()) {
            memoryStore.delete(key)
            return null
        }
        return item.value
    },
    async set(key, value, ...args) {
        if (isConnected) {
            try { return await realRedis.set(key, value, ...args) } catch (_) {}
        }
        let ttlMs = null
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === "string" && args[i].toUpperCase() === "EX" && args[i + 1]) {
                ttlMs = Number(args[i + 1]) * 1000
                break
            }
            if (typeof args[i] === "string" && args[i].toUpperCase() === "PX" && args[i + 1]) {
                ttlMs = Number(args[i + 1])
                break
            }
        }
        memoryStore.set(key, {
            value: String(value),
            expires: ttlMs ? Date.now() + ttlMs : null
        })
        return "OK"
    },
    async del(key) {
        if (isConnected) {
            try { return await realRedis.del(key) } catch (_) {}
        }
        return memoryStore.delete(key) ? 1 : 0
    },
    async incr(key) {
        if (isConnected) {
            try { return await realRedis.incr(key) } catch (_) {}
        }
        const current = Number(memoryStore.get(key)?.value || 0) + 1
        const existingExpires = memoryStore.get(key)?.expires || null
        memoryStore.set(key, { value: String(current), expires: existingExpires })
        return current
    },
    async decr(key) {
        if (isConnected) {
            try { return await realRedis.decr(key) } catch (_) {}
        }
        const current = Number(memoryStore.get(key)?.value || 0) - 1
        const existingExpires = memoryStore.get(key)?.expires || null
        memoryStore.set(key, { value: String(current), expires: existingExpires })
        return current
    },
    async expire(key, seconds) {
        if (isConnected) {
            try { return await realRedis.expire(key, seconds) } catch (_) {}
        }
        const item = memoryStore.get(key)
        if (!item) return 0
        item.expires = Date.now() + Number(seconds) * 1000
        memoryStore.set(key, item)
        return 1
    }
}

export default redis
