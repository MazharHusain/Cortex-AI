import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body
    const file = req.file
    const userId = req.headers["x-user-id"] || "anonymous"

    try {
      if (conversationId && conversationId !== "undefined") {
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
          conversationId,
          role: "user",
          content: prompt
        }, { timeout: 4000 })
      }
    } catch (chatErr) {
      console.error(chatErr.message)
    }

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file
    })

    let sources = []
    if (Array.isArray(result?.sources) && result.sources.length > 0) {
      sources = result.sources
    } else if (result?.searchResults) {
      try {
        const sr = typeof result.searchResults === 'string' ? JSON.parse(result.searchResults) : result.searchResults
        const raw = Array.isArray(sr?.results) ? sr.results : (Array.isArray(sr) ? sr : [])
        sources = raw.map((r, i) => {
          let domain = ""
          let siteName = ""
          try {
            const u = new URL(r.url)
            domain = u.hostname.replace(/^www\./, '')
            const parts = domain.split('.')
            siteName = parts[0]
            siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1)
          } catch (e) {
            domain = "web"
            siteName = "Source"
          }
          return {
            id: i + 1,
            title: r.title || domain,
            url: r.url,
            domain,
            siteName,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            snippet: r.content || ""
          }
        }).filter(s => s.url)
      } catch (e) {}
    }

    try {
      if (conversationId && conversationId !== "undefined") {
        await addMessage(conversationId, "user", prompt)
        await addMessage(conversationId, "assistant", result?.aiResponse || "")
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
          conversationId,
          role: "assistant",
          content: result?.aiResponse,
          images: result?.images,
          artifacts: result?.artifacts,
          sources: sources
        }, { timeout: 4000 })
      }
    } catch (chatErr) {
      console.error(chatErr.message)
    }

    return res.status(200).json({
      answer: result?.aiResponse || "No response generated.",
      images: result?.images || [],
      artifacts: result?.artifacts || [],
      sources: sources || []
    })
  } catch (error) {
    console.error(error)
    return res.status(200).json({
      answer: "Error processing your request: " + (error?.message || "Please try again."),
      images: [],
      artifacts: [],
      sources: []
    })
  }
}
