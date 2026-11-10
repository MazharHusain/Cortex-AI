import { fork } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const services = [
  { name: "auth", path: path.join(__dirname, "services/auth/index.js"), port: 8001 },
  { name: "chat", path: path.join(__dirname, "services/chat/index.js"), port: 8002 },
  { name: "agent", path: path.join(__dirname, "services/agent/index.js"), port: 8003 },
  { name: "gateway", path: path.join(__dirname, "gateway/index.js"), port: 8000 }
]

console.log("🚀 Starting all Indus GPT backend services...\n")

const processes = services.map(({ name, path: scriptPath, port }) => {
  const child = fork(scriptPath, [], {
    cwd: path.dirname(scriptPath),
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit"
  })

  child.on("exit", (code) => {
    console.log(`[${name}] process exited with code ${code}`)
  })

  return child
})

process.on("SIGINT", () => {
  console.log("\nShutting down all services...")
  processes.forEach(p => p.kill())
  process.exit(0)
})

process.on("SIGTERM", () => {
  processes.forEach(p => p.kill())
  process.exit(0)
})
