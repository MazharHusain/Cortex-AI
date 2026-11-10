import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import redis from "../redis/redis.js"

export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent } = req.body
        const file = req.file
        console.log("agent request:", { prompt, conversationId, agent, hasFile: !!file })
        const userId = req.headers["x-user-id"] || "anonymous"

        // 1. Save user message to chat service (non-blocking)
        try {
            if (conversationId && conversationId !== "undefined") {
                await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                    conversationId, role: "user", content: prompt
                }, { timeout: 4000 })
            }
        } catch (chatErr) {
            console.error("Non-blocking warning: Failed to save user message:", chatErr.message)
        }

        // 2. Invoke AI Graph
        const result = await graph.invoke({
            prompt, conversationId, agent, userId, file
        })
        console.log("graph.invoke completed successfully")

        // 3. Save memory and assistant message (non-blocking)
        try {
            if (conversationId && conversationId !== "undefined") {
                await addMessage(conversationId, "user", prompt)
                await addMessage(conversationId, "assistant", result?.aiResponse || "")
                await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                    conversationId,
                    role: "assistant",
                    content: result?.aiResponse,
                    images: result?.images,
                    artifacts: result?.artifacts
                }, { timeout: 4000 })
            }
        } catch (chatErr) {
            console.error("Non-blocking warning: Failed to save assistant message:", chatErr.message)
        }

        let sources = []
        if (Array.isArray(result?.sources) && result.sources.length > 0) {
            sources = result.sources
        } else if (result?.searchResults) {
            try {
                const sr = typeof result.searchResults === 'string' ? JSON.parse(result.searchResults) : result.searchResults
                if (Array.isArray(sr?.results)) {
                    sources = sr.results.map(r => ({ title: r.title, url: r.url })).filter(s => s.url)
                } else if (Array.isArray(sr)) {
                    sources = sr.map(r => ({ title: r.title, url: r.url })).filter(s => s.url)
                }
            } catch (e) {}
        }

        return res.status(200).json({
            answer: result?.aiResponse || "No response generated.",
            images: result?.images || [],
            artifacts: result?.artifacts || [],
            sources: sources || []
        })

    } catch (error) {
        console.error("Agent execution error:", error)
        return res.status(200).json({
            answer: "Error processing your request: " + (error?.message || "Please try again."),
            images: [],
            artifacts: []
        })
    }
}
