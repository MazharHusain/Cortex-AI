import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, ".env") })
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })
dotenv.config()

import connectDb from "./config/db.js"
import router from "./routes/chat.routes.js"

const port = process.env.PORT || 8002

const app=express()
app.use(express.json())
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message:"hello from chat"})
})

app.listen(port,()=>{
    console.log(`chat started at ${port}`)
    connectDb()
})
