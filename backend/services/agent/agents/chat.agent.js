import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "chat")
    const llm = await getModel("chat")
    const history = await getMemory(state.conversationId)

    let searchContext = ""
    let sources = []
    let parsedResults = state.searchResults
    if (typeof parsedResults === "string") {
      try {
        parsedResults = JSON.parse(parsedResults)
      } catch (e) {}
    }
    const rawResults = parsedResults?.results || (Array.isArray(parsedResults) ? parsedResults : [])
    if (Array.isArray(rawResults) && rawResults.length > 0) {
      sources = rawResults.map((r, i) => {
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

      if (sources.length > 0) {
        const formattedSources = sources.map(s => `[${s.id}] "${s.title}" (${s.siteName}) - ${s.url}\nSummary: ${s.snippet}`).join("\n\n")
        searchContext = `
Web Search Results:
${formattedSources}

Instructions for search results:
- Answer the user's question accurately using these verified search results.
- Cite the relevant source inline right after factual statements using bracketed numbers like [1], [2], or [3] matching the source numbers above.
- Never invent or fabricate URLs or sources.`
      }
    }

    const systemPrompt = `You are Indus GPT, an advanced and intelligent AI assistant.
${searchContext}

LANGUAGE MATCHING (Strict Requirement):
- Always reply in the EXACT SAME language, tone, and script that the user used.
- If the user speaks in Hinglish (Romanized Hindi like "Elon Musk kon hai?", "Salman Khan kon hai?", "kaise ho bhai"), reply in fluent, natural Hinglish.
- If the user speaks in Hindi (Devanagari), reply in Hindi.
- If the user speaks in English, reply in English.
- If the user speaks in Urdu, reply in Urdu.
- NEVER translate the user's query or explain what it means in English (e.g. NEVER output 'Note: "X kon hai" translates to "Who is X" in English').
- Reply directly to the user in their language.

CONTENT & FORMATTING:
- Answer directly and helpfully without rigid boilerplate templates.
- For biographies, general questions, or explanations, provide an engaging, well-structured, and accurate response.
- Do NOT output any code blocks, code sections, or technical disclaimers unless the user explicitly requested code.
- Use clean Markdown with bullet points, numbered lists, or bold text where helpful.
- Keep paragraphs readable and concise.`

    const messages = [
      new SystemMessage(systemPrompt)
    ]

    history.forEach(msg => {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content))
      }
      if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content))
      }
    })

    messages.push(new HumanMessage(state.prompt))

    const response = await llm.invoke(messages)
    deductCredits(state.userId, "chat").catch(() => {})

    let cleanResponse = (response.content || "")
      .replace(/(?:#{1,6}\s*)?\**Optimized Code(?:\s*\(if needed\))?\**[:\s]*[\s\S]*?(?=(?:#{1,6}\s|\n\n[A-Z]|$))/gi, "")
      .replace(/Optimized Code[\s\S]*$/gi, "")
      .trim()

    return {
      ...state,
      aiResponse: cleanResponse,
      sources
    }
  } catch (error) {
    console.log(error)
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate chat"
    }
  }
}
