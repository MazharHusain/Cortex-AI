import Redis from "ioredis"
import fs from "fs"
import os from "os"
import path from "path"

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
    console.log("local redis offline (shared local cache active)")
})

const storeFile = path.join(os.tmpdir(), "cortex_redis_store.json")

function readStore() {
    try {
        if (fs.existsSync(storeFile)) {
            return JSON.parse(fs.readFileSync(storeFile, "utf8"))
        }
    } catch (_) {}
    return {}
}

function writeStore(data) {
    try {
        fs.writeFileSync(storeFile, JSON.stringify(data), "utf8")
    } catch (_) {}
}

const redis = {
    async get(key) {
        if (isConnected) {
            try { return await realRedis.get(key) } catch (_) {}
        }
        const data = readStore()
        const item = data[key]
        if (!item) return null
        if (item.expires && item.expires < Date.now()) {
            delete data[key]
            writeStore(data)
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
        const data = readStore()
        data[key] = {
            value: String(value),
            expires: ttlMs ? Date.now() + ttlMs : null
        }
        writeStore(data)
        return "OK"
    },
    async del(key) {
        if (isConnected) {
            try { return await realRedis.del(key) } catch (_) {}
        }
        const data = readStore()
        if (key in data) {
            delete data[key]
            writeStore(data)
            return 1
        }
        return 0
    },
    async incr(key) {
        if (isConnected) {
            try { return await realRedis.incr(key) } catch (_) {}
        }
        const data = readStore()
        const current = Number(data[key]?.value || 0) + 1
        const existingExpires = data[key]?.expires || null
        data[key] = { value: String(current), expires: existingExpires }
        writeStore(data)
        return current
    },
    async decr(key) {
        if (isConnected) {
            try { return await realRedis.decr(key) } catch (_) {}
        }
        const data = readStore()
        const current = Number(data[key]?.value || 0) - 1
        const existingExpires = data[key]?.expires || null
        data[key] = { value: String(current), expires: existingExpires }
        writeStore(data)
        return current
    },
    async expire(key, seconds) {
        if (isConnected) {
            try { return await realRedis.expire(key, seconds) } catch (_) {}
        }
        const data = readStore()
        if (!data[key]) return 0
        data[key].expires = Date.now() + Number(seconds) * 1000
        writeStore(data)
        return 1
    }
}

export default redis
