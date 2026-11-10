import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 3) {
            return null
        }
        return Math.min(times * 200, 1000)
    },
    enableOfflineQueue: false,
    lazyConnect: true
})

redis.on("error", (err) => {
    // Suppress unhandled crash when Redis server is offline locally
})

redis.on("connect", () => {
    console.log("redis connected")
})

redis.connect().catch(() => {
    console.log("local redis offline (optional memory cache active)")
})

export default redis
