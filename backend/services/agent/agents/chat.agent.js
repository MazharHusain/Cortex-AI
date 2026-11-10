import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

   

    try {

        await checkAgentLimit(state.userId,"chat")

         const llm = await getModel("chat")

    const history = await getMemory(state.conversationId)

   const searchContext=state.searchResults?`
   Web Search Results:

${JSON.stringify(state.searchResults)}

Answer the user using only the above search results.
`:""


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
- Answer directly and helpfully without rigid boilerplate templates like "Problems", "Improvements", "Best Practices", or "Optimized Code (if needed): N/A".
- For biographies, general questions, or explanations, provide an engaging, well-structured, and accurate response.
- Use clean Markdown with bullet points, numbered lists, or bold text where helpful.
- Keep paragraphs readable and concise.`

    const messages = [
        new SystemMessage(systemPrompt)
    ]

    history.forEach(msg => {
        if (msg.role == "user") {
            messages.push(new HumanMessage(msg.content))
        }
        if (msg.role == "assistant") {
            messages.push(new AIMessage(msg.content))
        }
    });

    messages.push(new HumanMessage(state.prompt))

    const response = await llm.invoke(messages)
    await deductCredits(state.userId,"chat")

    let sources = []
    if (state.searchResults?.results && Array.isArray(state.searchResults.results)) {
        sources = state.searchResults.results.map(r => ({ title: r.title, url: r.url })).filter(s => s.url)
    }

    return {
        ...state,
        aiResponse: response.content,
        sources
    }
    } catch (error) {
        console.log(error)
         return {
            ...state,
            aiResponse:error?.data?.message || "failed to generate chat"
        }
        
    
    }
   
}