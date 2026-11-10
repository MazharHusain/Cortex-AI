import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
import billingRouter from "./billing/routes/billing.route.js"
import { guestChatGate, optionalAuth } from "./middleware/guest.middleware.js"
const port =process.env.PORT

const app=express()

const connectDb = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required by the billing API")
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("gateway db connected")
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.includes("vercel.app") || origin.includes("localhost") || origin === process.env.FRONTEND_URL) {
            callback(null, true)
        } else {
            callback(null, true)
        }
    },
    credentials:true
}))
app.use(morgan("dev"))
app.use(cookieParser())

app.use("/api/auth",proxy(process.env.AUTH_SERVICE))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent", optionalAuth, guestChatGate, proxyWithHeader(process.env.AGENT_SERVICE))

app.use("/api/billing", protect, express.json(), billingRouter)

app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway v6"})
})

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`gateway started at ${port}`)
        })
    })
    .catch((error) => {
        console.error(`gateway startup error: ${error.message}`)
        process.exit(1)
    })
