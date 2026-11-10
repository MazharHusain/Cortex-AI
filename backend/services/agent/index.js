import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, ".env") })
dotenv.config()
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"

const port = process.env.PORT || 8003

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "hello from agent" })
})

app.use("/", router)

app.use((err, req, res, next) => {
  console.log(err)
  if (err.status) {
    return res.status(err.status).json(err.data)
  }
  return res.status(500).json({ message: "agent error" })
})

app.listen(port, () => {
  console.log(`agent started at ${port}`)
  connectDb()
})
